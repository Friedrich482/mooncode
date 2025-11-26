import { Test, TestingModule } from '@nestjs/testing';

import { PendingRegistrationsService } from './pending-registrations.service';

describe('PendingRegistrationsService', () => {
  let service: PendingRegistrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PendingRegistrationsService],
    }).compile();

    service = module.get<PendingRegistrationsService>(PendingRegistrationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
