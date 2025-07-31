import {
  INCORRECT_PASSWORD_MESSAGE,
  USER_NOT_FOUND_MESSAGE,
} from "@repo/common/constants";
import {
  JwtPayloadDtoType,
  RegisterUserDtoType,
  SignInUserDtoType,
} from "@repo/common/types";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import { TRPCError } from "@trpc/server";
import { TrpcContext } from "src/trpc/trpc.service";
import { UsersService } from "src/users/users.service";
import { compare } from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  private readonly AUTH_COOKIE_NAME = "auth_token";

  async signIn(signInDto: SignInUserDtoType, response: Response) {
    const { password: pass, email, callbackUrl } = signInDto;

    const user = await this.usersService.findByEmail({ email });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: USER_NOT_FOUND_MESSAGE,
      });
    }

    const isPasswordCorrect = await compare(pass, user.password);
    if (!isPasswordCorrect) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: INCORRECT_PASSWORD_MESSAGE,
      });
    }

    const payload: Pick<JwtPayloadDtoType, "sub"> = { sub: user.id };
    const token = await this.jwtService.signAsync(payload);

    // Set the HTTP-only cookie
    response.cookie(this.AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 28 * 24 * 60 * 60 * 1000, // 28 days
    });

    if (callbackUrl) {
      //  the request has been sent by the extension
      if (
        !callbackUrl.startsWith("vscode://") ||
        !callbackUrl.includes("/auth-callback")
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid callback url",
        });
      }
      return {
        access_token: token,
      };
    }
  }

  async register(registerDto: RegisterUserDtoType, response: Response) {
    const { username, email, password, callbackUrl } = registerDto;
    const createdUser = await this.usersService.create({
      username,
      email,
      password,
    });

    const payload: Pick<JwtPayloadDtoType, "sub"> = { sub: createdUser.id };
    const token = await this.jwtService.signAsync(payload);

    // Set the HTTP-only cookie
    response.cookie(this.AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 28 * 24 * 60 * 60 * 1000,
    });

    if (callbackUrl) {
      //  the request has been sent by the extension
      if (
        !callbackUrl.startsWith("vscode://") ||
        !callbackUrl.includes("/auth-callback")
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid callback url",
        });
      }
      return {
        access_token: token,
      };
    }

    return {
      access_token: token,
    };
  }

  async checkAuthStatus(ctx: TrpcContext) {
    // the protectedProcedure check has been passed so the user is authenticated
    return { isAuthenticated: true, user: ctx.user };
  }

  async getUser(ctx: TrpcContext) {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }
    const { sub } = ctx.user;
    const { email, id, username } = await this.usersService.findOne({
      id: sub,
    });

    return {
      email,
      id,
      username,
    };
  }

  async logOut(response: Response) {
    response.clearCookie(this.AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
  }
}
