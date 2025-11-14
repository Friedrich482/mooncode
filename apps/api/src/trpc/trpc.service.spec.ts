import { Test, TestingModule } from "@nestjs/testing";

import { TrpcService } from "./trpc.service";

describe("TrpcService", () => {
  let service: TrpcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrpcService],
    }).compile();

    service = module.get<TrpcService>(TrpcService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
