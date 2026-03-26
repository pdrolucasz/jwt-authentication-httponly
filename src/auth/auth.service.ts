import { Injectable, UnauthorizedException } from "@nestjs/common"
import { UsersService } from "../users/users.service"
import { JwtService } from "@nestjs/jwt"

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async signIn(email: string, password: string, expiresIn = "10s"): Promise<{ access_token: string }> {
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
}
