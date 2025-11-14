import { Test, TestingModule } from "@nestjs/testing";

import { FilesStatsService } from "./files-stats.service";

describe("FilesStatsService", () => {
  let service: FilesStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesStatsService],
    }).compile();

    service = module.get<FilesStatsService>(FilesStatsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
