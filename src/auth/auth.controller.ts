import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards, Get } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { type Response, type Request } from "express"
import { AuthGuard } from "./auth.guard"

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@HttpCode(HttpStatus.OK)
	@Post("login")
	async signIn(@Body() signInDto: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
		const accessToken = await this.authService.signIn(signInDto.email, signInDto.password)
		const refreshToken = await this.authService.signIn(signInDto.email, signInDto.password, "20s")

		res.cookie("access_token", accessToken.access_token, {
			path: "/",
			maxAge: 4 * 60 * 1000,
			httpOnly: true,
			secure: true,
			sameSite: "strict",
		})
		res.cookie("refresh_token", refreshToken.access_token, {
			path: "/",
			maxAge: 20 * 60 * 1000,
			httpOnly: true,
			secure: true,
			sameSite: "strict",
		})

		return res.status(201).json({ message: "Session created" })
	}

	@UseGuards(AuthGuard)
	@Get("profile")
	getProfile(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		return res.status(200).json({ user: req.user })
	}

	@Post("refresh-token")
	async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const refreshToken = req.cookies?.refresh_token
		if (!refreshToken) {
			return res.status(404).json({ message: "Not found", statusCode: 404 })
		}
		const payload = await this.authService.getValidPayload(refreshToken)

		if (!payload) {
			res.clearCookie("access_token")
			res.clearCookie("refresh_token")
			return res.status(401).json({ message: "Unauthorized", statusCode: 401 })
		}

		const accessToken = await this.authService.generateToken(payload.sub, payload.email)

		res.cookie("access_token", accessToken.access_token, {
			path: "/",
			maxAge: 4 * 60 * 1000,
			httpOnly: true,
			secure: true,
			sameSite: "strict",
		})

		return res.status(201).json({ message: "Session created", statusCode: 201 })
	}
}
