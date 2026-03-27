import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Request, Response } from "express"

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest()
		const response = context.switchToHttp().getResponse()
		const token = this.extractTokenFromHeader(request)
		if (!token) {
			throw new UnauthorizedException()
		}
		try {
			// 💡 Here the JWT secret key that's used for verifying the payload
			// is the key that was passed in the JwtModule
			const payload = await this.jwtService.verifyAsync(token)
			// 💡 We're assigning the payload to the request object here
			// so that we can access it in our route handlers
			request["user"] = payload
		} catch {
			// if (error.name === "TokenExpiredError") {
			// 	return this.handleRefresh(request, response)
			// }
			throw new UnauthorizedException()
		}
		return true
	}

	private async handleRefresh(request: Request, response: Response) {
		const refreshToken = request.cookies?.refresh_token

		if (!refreshToken) return false

		try {
			const payload = await this.jwtService.verifyAsync(refreshToken)

			const newAccessToken = await this.jwtService.signAsync(
				{
					sub: payload.sub,
					email: payload.email,
				},
				{ expiresIn: "5s" },
			)
			// const newRefreshToken = await this.jwtService.signAsync(payload, { expiresIn: "20s" })

			response.cookie("access_token", newAccessToken, {
				path: "/",
				maxAge: 4 * 60 * 1000,
				httpOnly: true,
				secure: true,
				sameSite: "strict",
			})
			// response.cookie("refresh_token", newRefreshToken, {
			// 	path: "/",
			// 	maxAge: 20 * 60 * 1000,
			// 	httpOnly: true,
			// 	secure: true,
			// 	sameSite: "strict",
			// })

			request["user"] = payload

			return true
		} catch {
			return false
		}
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		// const [type, token] = request.headers.authorization?.split(" ") ?? []
		const accessToken = request.cookies?.access_token
		return accessToken
		// return type === "Bearer" ? token : undefined
	}
}
