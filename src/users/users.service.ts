import { Injectable } from "@nestjs/common"

// This should be a real class/interface representing a user entity
export type User = {
	id: number
	name: string
	email: string
	password: string
}

@Injectable()
export class UsersService {
	private readonly users = [
		{
			id: 1,
			name: "pedro",
			password: "pedro",
			email: "pedro@pedro.com",
		},
	]

	async findOne(email: string): Promise<User | undefined> {
		return new Promise((resolve) => setTimeout(() => resolve(this.users.find((user) => user.email === email)), 500))
	}
}
