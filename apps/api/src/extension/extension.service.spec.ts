import { Test, TestingModule } from "@nestjs/testing";

import { ExtensionService } from "./extension.service";

describe("ExtensionService", () => {
  let service: ExtensionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtensionService],
    }).compile();

    service = module.get<ExtensionService>(ExtensionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
