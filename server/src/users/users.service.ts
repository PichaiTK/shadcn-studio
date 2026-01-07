import { Injectable } from "@nestjs/common"
import type { Model } from "mongoose"
import type { User } from "./user.schema"

@Injectable()
export class UsersService {
  private userModel: Model<User>

  constructor(userModel: Model<User>) {
    this.userModel = userModel
  }

  async create(userData: any): Promise<User> {
    const user = new this.userModel(userData)
    return user.save()
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec()
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec()
  }
}
