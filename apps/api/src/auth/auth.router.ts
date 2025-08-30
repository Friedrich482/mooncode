import { RegisterUserDto, SignInUserDto } from "@repo/common/schemas";
import { AuthService } from "./auth.service";
import { Injectable } from "@nestjs/common";
import { TrpcService } from "src/trpc/trpc.service";

@Injectable()
export class AuthRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly authService: AuthService,
  ) {}

  procedures = {
    auth: this.trpcService.trpc.router({
      signInUser: this.trpcService
        .publicProcedure()
        .input(SignInUserDto)
        .mutation(async ({ input, ctx }) =>
          this.authService.signIn(input, ctx.res),
        ),

      registerUser: this.trpcService
        .publicProcedure()
        .input(RegisterUserDto)
        .mutation(async ({ input, ctx }) =>
          this.authService.register(input, ctx.res),
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
