import { Injectable, UnauthorizedException } from "@nestjs/common"
import { UsersService } from "../users/users.service"
import { JwtService } from "@nestjs/jwt"

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async signIn(email: string, password: string, expiresIn = "5s"): Promise<{ access_token: string }> {
		const user = await this.usersService.findOne(email)
		if (user?.password !== password) {
			throw new UnauthorizedException()
		}
		const payload = { sub: user.id, email: user.email }
		// TODO: Generate a JWT and return it here
		// instead of the user object
		return {
			access_token: await this.jwtService.signAsync(payload, { expiresIn: expiresIn as any }),
		}
	}

	async getValidPayload(token: string): Promise<{ sub: number; email: string } | undefined> {
		try {
			const payload = await this.jwtService.verifyAsync(token)

			if (payload) {
				return {
					email: payload.email,
					sub: payload.sub,
				}
			}
		} catch {
			return undefined
		}
		return undefined
	}

	async generateToken(sub: number, email: string, expiresIn = "5s"): Promise<{ access_token: string }> {
		const payload = { sub, email }
		// TODO: Generate a JWT and return it here
		// instead of the user object
		return {
			access_token: await this.jwtService.signAsync(payload, { expiresIn: expiresIn as any }),
		}
	}
}
