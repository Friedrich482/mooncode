import { Test, TestingModule } from "@nestjs/testing";

import { EmailVerificationsService } from "./email-verifications.service";

describe("EmailVerificationsService", () => {
  let service: EmailVerificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailVerificationsService],
    }).compile();

    service = module.get<EmailVerificationsService>(EmailVerificationsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
