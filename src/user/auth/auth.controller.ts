import { UserType } from '@prisma/client';
import { SignupDto, SigninDto, GenerateProdKeyDto } from './../dtos/auth.dto';
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Param,
  ParseEnumPipe,
  Post,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User, UserInfo } from '../decorator/user.decorator';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup/:userType')
  async signup(
    @Body() body: SignupDto,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
  ) {
    if (userType !== UserType.BUYER) {
      if (!body.productKey) {
        throw new UnauthorizedException();
      }

      const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_SECRET_KEY}`;
      const isValidProductKey = await bcrypt.compare(
        validProductKey,
        body.productKey,
      );
      if (!isValidProductKey) {
        throw new UnauthorizedException();
      }
    }

    return this.authService.signup(body, userType);
  }

  @Post('/signin')
  signin(@Body() body: SigninDto) {
    return this.authService.signin(body);
  }

  @Post('/key')
  generateProductKey(@Body() { userType, email }: GenerateProdKeyDto) {
    return this.authService.generateProductKey(email, userType);
  }

  @Get('/me')
  getMe(@User() user: UserInfo) {
    return user;
  }
}
