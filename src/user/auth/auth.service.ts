import { PrismaService } from './../../prisma/prisma.service';
import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';

interface SignupParams {
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface SigninParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  private generateJwtToken(name: string, id: number) {
    return jwt.sign(
      {
        name,
        id,
      },
      process.env.JSON_SECRET_KEY,
      {
        expiresIn: '30d',
      },
    );
  }

  generateProductKey(email: string, userType: UserType) {
    const string = `${email}-${userType}-${process.env.PRODUCT_SECRET_KEY}`;

    return bcrypt.hash(string, 10);
  }

  async signup(
    { email, password, name, phone }: SignupParams,
    userType: UserType,
  ) {
    const userExist = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (userExist) {
      throw new ConflictException('Email already exist');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        user_type: userType,
      },
    });

    return this.generateJwtToken(user.name, user.id);
  }

  async signin({ email, password }: SigninParams) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new HttpException('User not found or incorrect information!', 400);
    }
    const hashedPassword = user.password;
    const isValidPassword = await bcrypt.compare(password, hashedPassword);
    if (!isValidPassword) {
      throw new HttpException('User not found or incorrect information!', 400);
    }

    return this.generateJwtToken(user.name, user.id);
  }
}
