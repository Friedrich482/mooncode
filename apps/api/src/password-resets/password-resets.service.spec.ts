import { Test, TestingModule } from "@nestjs/testing";

import { PasswordResetsService } from "./password-resets.service";

describe("PasswordResetsService", () => {
  let service: PasswordResetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordResetsService],
    }).compile();

    service = module.get<PasswordResetsService>(PasswordResetsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
