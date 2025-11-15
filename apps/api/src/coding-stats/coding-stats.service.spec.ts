import { Test, TestingModule } from "@nestjs/testing";

import { CodingStatsService } from "./coding-stats.service";

describe("CodingStatsService", () => {
  let service: CodingStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodingStatsService],
    }).compile();

    service = module.get<CodingStatsService>(CodingStatsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
