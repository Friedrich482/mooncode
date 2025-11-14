import {
  GoogleUserSchema,
  HandleGoogleCallBacKDtoType,
  RedirectToGoogleDtoType,
} from "./auth.dto";
import {
  INCORRECT_PASSWORD_MESSAGE,
  USER_NOT_FOUND_MESSAGE,
} from "@repo/common/constants";
import {
  JwtPayloadDtoType,
  RegisterUserDtoType,
  SignInUserDtoType,
} from "@repo/common/types-schemas";
import { EnvService } from "src/env/env.service";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { OAuth2Client } from "google-auth-library";
import { Response } from "express";
import { TRPCError } from "@trpc/server";
import { TrpcContext } from "src/trpc/trpc.service";
import { UsersService } from "src/users/users.service";
import { compare } from "bcrypt";
import handleErrorResponse from "./utils/handleErrorResponse";
import validateExtensionCallbackUrl from "./utils/validateExtensionCallbackUrl";
import validateStateQueryParam from "./utils/validateStateQueryParam";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
  ) {}
  private readonly AUTH_COOKIE_NAME = "auth_token";
  private readonly COOKIE_MAX_AGE = 28 * 24 * 60 * 60 * 1000; // 28 days

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
      maxAge: this.COOKIE_MAX_AGE,
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
    }

    return {
      accessToken: token,
    };
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
      maxAge: this.COOKIE_MAX_AGE,
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
    }

    return {
      accessToken: token,
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

  async redirectToGoogle(redirectToGoogleDto: RedirectToGoogleDtoType) {
    const { state, response, callback } = redirectToGoogleDto;

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.envService.get("GOOGLE_CLIENT_ID")}&` +
      `redirect_uri=${encodeURIComponent(this.envService.get("GOOGLE_REDIRECT_URI"))}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `state=${encodeURIComponent(JSON.stringify({ state, callback }))}`;

    response.redirect(googleAuthUrl);
  }

  async handleGoogleCallBack(
    handleGoogleCallBackDto: HandleGoogleCallBacKDtoType,
  ) {
    const { type, request, response } = handleGoogleCallBackDto;

    const returnUrl = validateStateQueryParam(
      request,
      this.envService.get("NODE_ENV"),
    );
    const callbackUrl = validateExtensionCallbackUrl(request);

    const url = new URL(returnUrl);
    const errorUrl = new URL(`${returnUrl}/login`);

    if (type === "error") {
      handleErrorResponse({
        url: errorUrl,
        error: handleGoogleCallBackDto.error,
        errorDescription:
          "Something went wrong during the authentication process. Please try again",
        response,
      });

      return;
    }

    const code = handleGoogleCallBackDto.code;

    const client = new OAuth2Client({
      clientId: this.envService.get("GOOGLE_CLIENT_ID"),
      clientSecret: this.envService.get("GOOGLE_CLIENT_SECRET"),
      redirectUri: this.envService.get("GOOGLE_REDIRECT_URI"),
    });

    try {
      const {
        tokens: { access_token: accessToken },
      } = await client.getToken(code);

      if (!accessToken) {
        handleErrorResponse({
          url: errorUrl,
          error: "No access token received from Google",
          errorDescription:
            "Something went wrong during the authentication process. Please try again",
          response,
        });

        return;
      }

      const googleRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (!googleRes.ok) {
        throw new Error("Failed to fetch Google user info");
      }

      const body = await googleRes.json();

      const googleUser = GoogleUserSchema.parse(body);
      const existingUser = await this.usersService.findByGoogleEmail({
        googleEmail: googleUser.email,
      });

      const user: { userId: string; email: string } = { userId: "", email: "" };

      if (existingUser) {
        // TODO fix this update, do we need to update ?
        const { email } = await this.usersService.update({
          id: existingUser.id,
          googleId: googleUser.id,
          googleEmail: googleUser.email,
          authMethod: "google",
        });

        user.userId = existingUser.id;
        user.email = email;
      } else {
        const newUser = await this.usersService.createGoogleUser({
          email: googleUser.email,
          googleId: googleUser.id,
          profilePicture: googleUser.picture,
          googleEmail: googleUser.email,
          username: googleUser.name,
          authMethod: "google",
        });

        user.userId = newUser.id;
        user.email = newUser.email;
      }

      const payload: Pick<JwtPayloadDtoType, "sub"> = { sub: user.userId };
      const token = await this.jwtService.signAsync(payload);

      response.cookie(this.AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: this.COOKIE_MAX_AGE,
      });

      response.redirect(
        `${url}${callbackUrl ? `?callback=${encodeURIComponent(callbackUrl)}&token=${token}&email=${encodeURIComponent(user.email)}` : ""}`.toString(),
      );
    } catch (error) {
      console.error("Google OAuth error:", error);
      if (error instanceof TRPCError) {
        handleErrorResponse({
          url: errorUrl,
          error: error.message,
          errorDescription: error.cause?.message || "An error occurred",
          response,
        });
      } else if (error instanceof Error) {
        handleErrorResponse({
          url: errorUrl,
          error: error.name,
          errorDescription: error.message,
          response,
        });
      }
      return;
    }
  }
}
