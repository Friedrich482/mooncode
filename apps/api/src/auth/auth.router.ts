import {
  CreatePasswordResetDto,
  VerifyCodeDto,
} from "src/password-resets/password-resets.dto";
import { TrpcService } from "src/trpc/trpc.service";

import { Injectable } from "@nestjs/common";
import {
  CreatePendingRegistrationDto,
  RegisterUserDto,
  ResetPasswordDto,
  SignInUserDto,
} from "@repo/common/types-schemas";

import { AuthService } from "./auth.service";

@Injectable()
export class AuthRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly authService: AuthService
  ) {}

  procedures = {
    auth: this.trpcService.trpc.router({
      signInUser: this.trpcService
        .publicProcedure()
        .input(SignInUserDto)
        .mutation(async ({ input, ctx }) =>
          this.authService.signIn(input, ctx.res)
        ),

      createPendingRegistration: this.trpcService
        .publicProcedure()
        .input(CreatePendingRegistrationDto)
        .mutation(async ({ input }) =>
          this.authService.createPendingRegistration(input)
        ),

      registerUser: this.trpcService
        .publicProcedure()
        .input(RegisterUserDto)
        .mutation(async ({ input, ctx }) =>
          this.authService.register(input, ctx.res)
        ),

      createPasswordReset: this.trpcService
        .publicProcedure()
        .input(CreatePasswordResetDto)
        .mutation(async ({ input }) =>
          this.authService.createPasswordReset(input)
        ),

      verifyResetCode: this.trpcService
        .publicProcedure()
        .input(VerifyCodeDto)
        .mutation(async ({ input }) => this.authService.verifyResetCode(input)),

      resetPassword: this.trpcService
        .publicProcedure()
        .input(ResetPasswordDto)
        .mutation(async ({ input, ctx }) =>
          this.authService.resetPassword(input, ctx.res)
        ),

      checkAuthStatus: this.trpcService
        .protectedProcedure()
        .query(async ({ ctx }) => this.authService.checkAuthStatus(ctx)),

      getUser: this.trpcService
        .protectedProcedure()
        .query(async ({ ctx }) => this.authService.getUser(ctx)),

      logOut: this.trpcService
        .publicProcedure()
        .mutation(async ({ ctx }) => this.authService.logOut(ctx.res)),
    }),
  };
}
