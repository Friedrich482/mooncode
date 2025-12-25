import { TrpcService } from "src/trpc/trpc.service";

import { Injectable } from "@nestjs/common";
import {
  CreatePasswordResetDto,
  CreatePendingRegistrationDto,
  RegisterUserDto,
  ResetPasswordDto,
  SignInUserDto,
  VerifyPasswordResetCodeDto,
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
      signIn: this.trpcService
        .publicProcedure({
          key: "auth.signIn",
          windowMs: 5 * 60 * 1000,
          max: 10,
        })
        .input(SignInUserDto)
        .mutation(async ({ input, ctx }) =>
          this.authService.signIn(input, ctx.res)
        ),

      createPendingRegistration: this.trpcService
        .publicProcedure({
          key: "auth.createPendingRegistration",
          windowMs: 60 * 60 * 1000,
          max: 5,
        })
        .input(CreatePendingRegistrationDto)
        .mutation(async ({ input }) =>
          this.authService.createPendingRegistration(input)
        ),

      register: this.trpcService
        .publicProcedure({
          key: "auth.register",
          windowMs: 5 * 60 * 1000,
          max: 10,
        })
        .input(RegisterUserDto)
        .mutation(async ({ input, ctx }) =>
          this.authService.register(input, ctx.res)
        ),

      createPasswordReset: this.trpcService
        .publicProcedure({
          key: "auth.createPasswordReset",
          windowMs: 60 * 60 * 1000,
          max: 6,
        })
        .input(CreatePasswordResetDto)
        .mutation(async ({ input }) =>
          this.authService.createPasswordReset(input)
        ),

      verifyPasswordResetCode: this.trpcService
        .publicProcedure({
          key: "auth.verifyResetCode",
          windowMs: 5 * 60 * 1000,
          max: 5,
        })
        .input(VerifyPasswordResetCodeDto)
        .mutation(async ({ input }) =>
          this.authService.verifyPasswordResetCode(input)
        ),

      resetPassword: this.trpcService
        .publicProcedure({
          key: "auth.resetPassword",
          windowMs: 5 * 60 * 1000,
          max: 6,
        })
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
