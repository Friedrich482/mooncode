import { Test, TestingModule } from "@nestjs/testing";

import { DailyDataService } from "./daily-data.service";

describe("DailyDataService", () => {
  let service: DailyDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyDataService],
    }).compile();

    service = module.get<DailyDataService>(DailyDataService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
