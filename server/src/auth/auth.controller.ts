import { Controller, Post, Get, Body, Request, UseGuards } from "@nestjs/common"
import type { AuthService } from "./auth.service"
import { JwtAuthGuard } from "./jwt-auth.guard"

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

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body)
  }

  @Post("login")
  async login(@Body() body: LoginDto) {
    return this.authService.login(body)
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return { user: req.user }
  }
}
