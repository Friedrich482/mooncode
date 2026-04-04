import { TrpcService } from "src/trpc/trpc.service";

import { Injectable } from "@nestjs/common";
import {
  CreateEmailUpdateSchema as createEmailUpdateDto,
  CreateEmailVerificationSchema as CreateEmailVerificationDto,
  CreatePasswordResetSchema as CreatePasswordResetDto,
  RegisterUserSchema as RegisterUserDto,
  ResetPasswordSchema as ResetPasswordDto,
  SignInUserSchema as SignInUserDto,
  UpdateEmailSchema as UpdateEmailDto,
  UpdateUsernameSchema as UpdateUsernameDto,
  VerifyEmailVerificationCodeSchema as VerifyEmailVerificationCodeDto,
  VerifyPasswordResetCodeSchema as VerifyPasswordResetCodeDto,
} from "@repo/common/types-schemas";

import { AuthService } from "./auth.service";

@Injectable()
export class AuthRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly authService: AuthService,
  ) {}
  private readonly AUTH_COOKIE_NAME = "auth_token";
  private readonly COOKIE_MAX_AGE = 28 * 24 * 60 * 60 * 1000; // 28 days

  procedures = {
    auth: this.trpcService.trpc.router({
      signIn: this.trpcService
        .publicProcedure({
          key: "auth.signIn",
          windowMs: 5 * 60 * 1000,
          max: 10,
        })
        .input(SignInUserDto)
        .mutation(async ({ input, ctx }) => {
          const { accessToken: token } = await this.authService.signIn(input);

          // Set the HTTP-only cookie
          ctx.res.cookie(this.AUTH_COOKIE_NAME, token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: this.COOKIE_MAX_AGE,
          });

          return {
            accessToken: token,
          };
        }),

      createEmailVerification: this.trpcService
        .publicProcedure({
          key: "auth.createEmailVerification",
          windowMs: 60 * 60 * 1000,
          max: 5,
        })
        .input(CreateEmailVerificationDto)
        .mutation(async ({ input }) =>
          this.authService.createEmailVerification(input),
        ),

      verifyEmailVerificationCode: this.trpcService
        .publicProcedure({
          key: "auth.verifyEmailVerificationCode",
          windowMs: 5 * 60 * 1000,
          max: 5,
        })
        .input(VerifyEmailVerificationCodeDto)
        .mutation(async ({ input }) =>
          this.authService.verifyEmailVerificationCode(input),
        ),

      register: this.trpcService
        .publicProcedure({
          key: "auth.register",
          windowMs: 5 * 60 * 1000,
          max: 10,
        })
        .input(RegisterUserDto)
        .mutation(async ({ input, ctx }) => {
          const { accessToken: token, email } =
            await this.authService.register(input);

          // Set the HTTP-only cookie
          ctx.res.cookie(this.AUTH_COOKIE_NAME, token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: this.COOKIE_MAX_AGE,
          });

          return {
            accessToken: token,
            email,
          };
        }),

      createPasswordReset: this.trpcService
        .publicProcedure({
          key: "auth.createPasswordReset",
          windowMs: 60 * 60 * 1000,
          max: 6,
        })
        .input(CreatePasswordResetDto)
        .mutation(async ({ input }) =>
          this.authService.createPasswordReset(input),
        ),

      verifyPasswordResetCode: this.trpcService
        .publicProcedure({
          key: "auth.verifyResetCode",
          windowMs: 5 * 60 * 1000,
          max: 5,
        })
        .input(VerifyPasswordResetCodeDto)
        .mutation(async ({ input }) =>
          this.authService.verifyPasswordResetCode(input),
        ),

      resetPassword: this.trpcService
        .publicProcedure({
          key: "auth.resetPassword",
          windowMs: 5 * 60 * 1000,
          max: 6,
        })
        .input(ResetPasswordDto)
        .mutation(async ({ input, ctx }) => {
          const {
            accessToken: token,
            email,
            message,
          } = await this.authService.resetPassword(input);

          // Set the HTTP-only cookie
          ctx.res.cookie(this.AUTH_COOKIE_NAME, token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: this.COOKIE_MAX_AGE,
          });

          return {
            accessToken: token,
            email,
            message,
          };
        }),

      checkAuthStatus: this.trpcService
        .protectedProcedure()
        .query(async ({ ctx }) => this.authService.checkAuthStatus(ctx)),

      getUser: this.trpcService
        .protectedProcedure()
        .query(async ({ ctx }) => this.authService.getUser(ctx)),

      updateUsername: this.trpcService
        .protectedProcedure()
        .input(UpdateUsernameDto)
        .mutation(async ({ input, ctx }) =>
          this.authService.updateUsername({ ...input, userId: ctx.user.sub }),
        ),

      createEmailUpdate: this.trpcService
        .protectedProcedure({
          key: "auth.createEmailUpdate",
          windowMs: 60 * 60 * 1000,
          max: 5,
        })
        .input(createEmailUpdateDto)
        .mutation(async ({ ctx, input }) =>
          this.authService.createEmailUpdate({
            ...input,
            userId: ctx.user.sub,
          }),
        ),

      updateEmail: this.trpcService
        .protectedProcedure({
          key: "auth.updateEmail",
          windowMs: 5 * 60 * 1000,
          max: 5,
        })
        .input(UpdateEmailDto)
        .mutation(async ({ ctx, input }) =>
          this.authService.updateEmail({ ...input, userId: ctx.user.sub }),
        ),

      logOut: this.trpcService.publicProcedure().mutation(async ({ ctx }) => {
        // Remove the cookie
        ctx.res.clearCookie(this.AUTH_COOKIE_NAME, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });
      }),

      deleteAccount: this.trpcService
        .protectedProcedure({
          key: "auth.deleteAccount",
          windowMs: 5 * 60 * 1000,
          max: 5,
        })
        .mutation(async ({ ctx }) => {
          await this.authService.deleteAccount({
            userId: ctx.user.sub,
          });

          // Remove the cookie to log the user out
          ctx.res.clearCookie(this.AUTH_COOKIE_NAME, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
          });
        }),
    }),
  };
}
