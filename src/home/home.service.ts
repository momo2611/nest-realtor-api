import { UserInfo } from 'src/user/decorator/user.decorator';
import { HomeResponseDto } from './dto/home.dto';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyType } from '@prisma/client';

interface GetHomeParams {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

interface CreateHomeParams {
  address: string;
  city: string;
  price: number;
  landSize: number;
  images: { url: string }[];
  propertyType: PropertyType;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
}

interface UpdateHomeParams {
  address?: string;
  city?: string;
  price?: number;
  landSize?: number;
  propertyType?: PropertyType;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
}

const homeSelect = {
  id: true,
  address: true,
  city: true,
  price: true,
  propertyType: true,
  number_of_bedrooms: true,
  number_of_bathrooms: true,
};

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(filter: GetHomeParams): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        images: {
          select: { url: true },
          take: 1,
        },
        propertyType: true,
        number_of_bedrooms: true,
        number_of_bathrooms: true,
      },
      where: filter,
    });

    if (!homes.length) {
      throw new NotFoundException('No home match your filter!');
    }

    return homes.map((home) => {
      const fetchHome = { ...home, image: home.images[0].url };
      delete fetchHome.images;
      return new HomeResponseDto(fetchHome);
    });
  }
  async getHomeById(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: { id },
      select: {
        ...homeSelect,
        images: {
          select: {
            url: true,
          },
        },
        realtor: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!home) {
      throw new NotFoundException('No home found with that id!');
    }
    return new HomeResponseDto(home);
  }

  async createHome(
    {
      address,
      city,
      price,
      images,
      landSize,
      propertyType,
      numberOfBedrooms,
      numberOfBathrooms,
    }: CreateHomeParams,
    userId: number,
  ) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        city,
        land_size: landSize,
        price,
        realtor_id: userId,
        propertyType,
        number_of_bedrooms: numberOfBedrooms,
        number_of_bathrooms: numberOfBathrooms,
      },
    });
    const homeImages = images.map((image) => {
      return { ...image, home_id: home.id };
    });

    await this.prismaService.image.createMany({ data: homeImages });

    return new HomeResponseDto(home);
  }

  async updateHomeById(id: number, data: UpdateHomeParams) {
    const home = await this.prismaService.home.findUnique({
      where: { id },
    });
    if (!home) throw new NotFoundException('No home found with that id!');

    const updatedHome = await this.prismaService.home.update({
      where: { id },
      data,
    });
    return new HomeResponseDto(updatedHome);
  }

  async deleteHomeById(id: number) {
    await this.prismaService.image.deleteMany({
      where: { home_id: id },
    });
    await this.prismaService.home.delete({
      where: { id },
    });
  }

  async getRealtorByHome(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: { id },
      select: {
        realtor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    if (!home) throw new NotFoundException('No home found with that id!');
    return home.realtor;
  }

  async inquire(buyer: UserInfo, homeId: number, message: string) {
    const realtor = await this.getRealtorByHome(homeId);

    const newMessage = await this.prismaService.message.create({
      data: {
        realtor_id: realtor.id,
        buyer_id: buyer.id,
        home_id: homeId,
        message,
      },
    });
  }

  getMessagesByHome(homeId: number) {
    return this.prismaService.message.findMany({
      where: { home_id: homeId },
      select: {
        message: true,
        buyer: {
          select: { name: true, phone: true, email: true },
        },
      },
    });
  }
}
