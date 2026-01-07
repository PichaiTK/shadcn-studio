import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { MongooseModule } from "@nestjs/mongoose"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { ChatModule } from "./chat/chat.module"
import { HealthModule } from "./health/health.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || "mongodb://localhost:27017/designconnect"),
    AuthModule,
    UsersModule,
    ChatModule,
    HealthModule,
  ],
})
export class AppModule {}
