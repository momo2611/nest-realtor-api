import { PrismaService } from './../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { HomeService } from './home.service';
import { PropertyType } from '@prisma/client';

const mockGetHomes = [
  {
    id: 1,
    address: '234 Tho Lao',
    city: 'Ha Noi',
    price: 342444,
    propertyType: PropertyType.RESIDENTIAL,
    image: 'img1',
    numberOfBedrooms: 2,
    numberOfBathrooms: 2.5,
    images: [
      {
        url: 'src1',
      },
    ],
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Toronto',
      price: {
        gte: 2000,
        lte: 4000,
      },
      propertyType: PropertyType.RESIDENTIAL,
    };

    it('should call prisma findMany with correct params', () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);
      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
