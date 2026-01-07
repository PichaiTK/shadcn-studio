import { Injectable, UnauthorizedException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import type { UsersService } from "../users/users.service"
import * as bcrypt from "bcrypt"

interface RegisterDto {
  name: string
  email: string
  phone?: string
  password: string
}

interface LoginDto {
  email: string
  password: string
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(userData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const user = await this.usersService.create({
      ...userData,
      password: hashedPassword,
    })
    return { message: "User registered successfully", userId: user._id }
  }

  async login(credentials: LoginDto) {
    const user = await this.usersService.findByEmail(credentials.email)
    if (!user) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const payload = { email: user.email, sub: user._id, role: user.role }
    const token = this.jwtService.sign(payload)

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  }
}
