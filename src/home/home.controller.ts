import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PropertyType, UserType } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { User, UserInfo } from 'src/user/decorator/user.decorator';
import {
  CreateHomeDto,
  HomeResponseDto,
  InquireDto,
  UpdateHomeDto,
} from './dto/home.dto';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('propertyType') propertyType?: PropertyType,
  ): Promise<HomeResponseDto[]> {
    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;

    const filter = {
      ...(city && { city }),
      ...(price && { price }),
      ...(propertyType && { propertyType }),
    };

    return this.homeService.getHomes(filter);
  }

  @Get(':id')
  getHomeById(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.getHomeById(id);
  }

  @Roles(UserType.REALTOR, UserType.ADMIN)
  @Post()
  createHome(@Body() body: CreateHomeDto, @User() user: UserInfo) {
    return this.homeService.createHome(body, user.id);
  }

  @Roles(UserType.REALTOR, UserType.ADMIN)
  @Put(':id')
  async updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomeDto,
    @User() user: UserInfo,
  ) {
    const realtor = await this.homeService.getRealtorByHome(id);
    if (realtor.id !== user.id)
      throw new UnauthorizedException(
        "You don't have permission to this action!",
      );

    return this.homeService.updateHomeById(id, body);
  }

  @Roles(UserType.REALTOR, UserType.ADMIN)
  @Delete(':id')
  async deleteHome(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserInfo,
  ) {
    const realtor = await this.homeService.getRealtorByHome(id);
    if (realtor.id !== user.id)
      throw new UnauthorizedException(
        "You don't have permission to this action!",
      );

    return this.homeService.deleteHomeById(id);
  }

  @Roles(UserType.BUYER)
  @Post('/inquire/:id')
  inquire(
    @Param('id', ParseIntPipe) homeId: number,
    @Body() { message }: InquireDto,
    @User() user: UserInfo,
  ) {
    return this.homeService.inquire(user, homeId, message);
  }

  @Roles(UserType.REALTOR)
  @Get('/:id/messages')
  async getHomeMessages(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserInfo,
  ) {
    const realtor = await this.homeService.getRealtorByHome(id);
    if (realtor.id !== user.id)
      throw new UnauthorizedException(
        "You don't have permission to this action!",
      );

    return this.homeService.getMessagesByHome(id);
  }
}
