import { Module } from '@nestjs/common';
import { AuthController } from 'src/auth/auth.controller'
import { AuthService } from 'src/auth/auth.service'
import { UsersModule } from 'src/users/users.module'

@Module({
    imports: [UsersModule],
    providers: [AuthService],
    controllers: [AuthController],
  })
export class AuthModule {}
