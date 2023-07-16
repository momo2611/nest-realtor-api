import { PropertyType } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class HomeResponseDto {
  id: number;
  address: string;
  city: string;
  price: number;
  image: string;

  @Exclude()
  land_size: number;
  @Expose({ name: 'landSize' })
  landSize() {
    return this.land_size;
  }

  @Exclude()
  number_of_bedrooms: number;
  @Expose({ name: 'numberOfBedrooms' })
  numberOfBedrooms() {
    return this.number_of_bedrooms;
  }

  @Exclude()
  number_of_bathrooms: number;
  @Expose({ name: 'numberOfBathrooms' })
  numberOfBathrooms() {
    return this.number_of_bathrooms;
  }

  propertyType: PropertyType;

  @Exclude()
  listed_date: Date;
  @Expose({ name: 'listedDate' })
  listedDate() {
    return this.listed_date;
  }

  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;
  @Exclude()
  realtor_id: number;

  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}

class Image {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateHomeDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images: Image[];

  @IsNumber()
  @IsPositive()
  landSize: number;

  @IsNumber()
  @IsPositive()
  numberOfBedrooms: number;

  @IsNumber()
  @IsPositive()
  numberOfBathrooms: number;

  @IsEnum(PropertyType)
  propertyType: PropertyType;
}

export class UpdateHomeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  landSize?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberOfBedrooms?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberOfBathrooms?: number;

  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;
}

export class InquireDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
