import { TrpcService } from "src/trpc/trpc.service";

import { Injectable } from "@nestjs/common";

import { CreatePasswordResetDto, VerifyCodeDto } from "./password-resets.dto";
import { PasswordResetsService } from "./password-resets.service";

@Injectable()
export class PasswordResetsRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly passwordResetsService: PasswordResetsService
  ) {}

  procedures = {
    passwordResets: this.trpcService.trpc.router({
      create: this.trpcService
        .publicProcedure()
        .input(CreatePasswordResetDto)
        .mutation(async ({ input }) =>
          this.passwordResetsService.create(input)
        ),

      verifyCode: this.trpcService
        .publicProcedure()
        .input(VerifyCodeDto)
        .mutation(async ({ input }) =>
          this.passwordResetsService.verifyCode(input)
        ),
    }),
  };
}
