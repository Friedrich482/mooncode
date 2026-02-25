import * as bcrypt from "bcrypt";
import { Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { EmailVerificationsService } from "src/email-verifications/email-verifications.service";
import { EnvService } from "src/env/env.service";
import { PasswordResetsService } from "src/password-resets/password-resets.service";
import { TrpcContext } from "src/trpc/trpc.service";
import { UsersService } from "src/users/users.service";

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  INCORRECT_PASSWORD_MESSAGE,
  USER_NOT_FOUND_MESSAGE,
} from "@repo/common/constants";
import {
  CreateEmailUpdate as CreateEmailUpdateDtoType,
  CreateEmailVerification as CreateEmailVerificationDtoType,
  CreatePasswordReset as CreatePasswordResetDtoType,
  JwtPayload as JwtPayloadDtoType,
  RegisterUser as RegisterUserDtoType,
  ResetPassword as ResetPasswordDtoType,
  SignInUser as SignInUserDtoType,
  UpdateEmail as UpdateEmailDtoType,
  UpdateUsername as UpdateUsernameDtoType,
  VerifyEmailVerificationCode as VerifyEmailVerificationCodeDtoType,
  VerifyPasswordResetCode as VerifyPasswordResetCodeDtoType,
} from "@repo/common/types-schemas";
import { TRPCError } from "@trpc/server";

import {
  GoogleUserSchema,
  HandleGoogleCallBacKDtoType,
  HandleGoogleLinkingCallBackDtoType,
  RedirectToGoogleDto,
  RedirectToGoogleDtoType,
  RedirectToGoogleForLinkingDto,
  RedirectToGoogleForLinkingDtoType,
} from "./auth.dto";
import { handleErrorResponse } from "./utils/handle-error-response";
import { validateExtensionCallbackUrl } from "./utils/validate-extension-callback-url";
import { validateStateQueryParam } from "./utils/validate-state-query-param";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
    private readonly emailVerificationService: EmailVerificationsService,
    private readonly passwordResetsService: PasswordResetsService,
  ) {}
  private readonly AUTH_COOKIE_NAME = "auth_token";
  private readonly COOKIE_MAX_AGE = 28 * 24 * 60 * 60 * 1000; // 28 days

  async signIn(signInDto: SignInUserDtoType, response: Response) {
    const { password: pass, email } = signInDto;

    const user = await this.usersService.findByEmail({ email });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: USER_NOT_FOUND_MESSAGE,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(pass, user.hashedPassword);
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

    return {
      accessToken: token,
    };
  }

  async createEmailVerification(
    createEmailVerificationDto: CreateEmailVerificationDtoType,
  ) {
    return this.emailVerificationService.create(createEmailVerificationDto);
  }

  async verifyEmailVerificationCode(
    verifyEmailVerificationCodeDto: VerifyEmailVerificationCodeDtoType,
  ) {
    return this.emailVerificationService.verifyCode(
      verifyEmailVerificationCodeDto,
    );
  }

  async register(registerDto: RegisterUserDtoType, response: Response) {
    const { token: emailVerificationId, password, username } = registerDto;

    const emailVerification = await this.emailVerificationService.findById({
      id: emailVerificationId,
    });

    if (!emailVerification) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message:
          "You have no email verification in process. Please go back and try again",
      });
    }

    if (!emailVerification.verifiedAt) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message:
          "Please verify your email first. Go back to the start of registration process",
      });
    }

    const createdUser = await this.usersService.create({
      username,
      email: emailVerification.email,
      password,
      emailVerifiedAt: emailVerification.verifiedAt,
    });

    // delete the email verification associated
    await this.emailVerificationService.delete({
      id: emailVerificationId,
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

    return {
      accessToken: token,
      email: createdUser.email,
    };
  }

  async createPasswordReset(
    createPasswordResetDto: CreatePasswordResetDtoType,
  ) {
    return this.passwordResetsService.create(createPasswordResetDto);
  }

  async verifyPasswordResetCode(
    verifyPasswordResetCodeDto: VerifyPasswordResetCodeDtoType,
  ) {
    return this.passwordResetsService.verifyCode(verifyPasswordResetCodeDto);
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDtoType,
    response: Response,
  ) {
    const { token: passwordResetId, newPassword } = resetPasswordDto;

    const existingPasswordReset = await this.passwordResetsService.findById({
      id: passwordResetId,
    });

    if (!existingPasswordReset) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message:
          "You have no password reset in process. Please go back and try again",
      });
    }

    // verify if the code is still valid
    await this.passwordResetsService.verifyCode({
      code: existingPasswordReset.code,
      id: passwordResetId,
    });

    const user = await this.usersService.findByEmail({
      email: existingPasswordReset.email,
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    await this.usersService.update({
      id: user.id,
      password: newPassword,
    });

    // delete the password reset associated
    await this.passwordResetsService.delete({ id: passwordResetId });

    const payload: Pick<JwtPayloadDtoType, "sub"> = { sub: user.id };
    const token = await this.jwtService.signAsync(payload);

    // Set the HTTP-only cookie
    response.cookie(this.AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: this.COOKIE_MAX_AGE,
    });

    return {
      accessToken: token,
      email: user.email,
      message: "Password reset successfully",
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
    const user = await this.usersService.findById({
      id: sub,
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: USER_NOT_FOUND_MESSAGE,
      });
    }

    return user;
  }

  async updateUsername(updateUsernameDto: UpdateUsernameDtoType) {
    const { userId, username } = updateUsernameDto;

    const existingUser = await this.usersService.findById({ id: userId });

    if (!existingUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const existingUserWithSameUsername = await this.usersService.findByUsername(
      { username },
    );

    if (existingUserWithSameUsername) {
      if (existingUserWithSameUsername.email === existingUser.email) {
        // this is the same user
        throw new TRPCError({
          code: "CONFLICT",
          message: "The username has not been changed",
        });
      }

      throw new TRPCError({
        code: "CONFLICT",
        message: "This username is already taken",
      });
    }

    const user = await this.usersService.update({
      id: existingUser.id,
      username,
    });

    return user;
  }

  async createEmailUpdate(createEmailUpdateDto: CreateEmailUpdateDtoType) {
    const { userId, email } = createEmailUpdateDto;

    const existingUser = await this.usersService.findById({ id: userId });

    if (!existingUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const existingUserWithSameEmail = await this.usersService.findByEmail({
      email,
    });

    if (existingUserWithSameEmail) {
      if (existingUserWithSameEmail.email === existingUser.email) {
        // this is the same user
        throw new TRPCError({
          code: "CONFLICT",
          message: "The email has not been changed",
        });
      }

      throw new TRPCError({
        code: "CONFLICT",
        message: "This email is already taken",
      });
    }

    // don't allow the users with google account to add another account
    if (existingUser.authMethod === "google") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message:
          "You are not allowed to perform an email update since you are already connected with your google account",
      });
    }

    const { message, verificationToken } = await this.createEmailVerification({
      email,
      type: "email update",
    });

    // send a notification email to the old email address
    await this.emailVerificationService.sendEmail({
      type: "notice email update",
      email: existingUser.email,
    });

    return { message, verificationToken };
  }

  async updateEmail(updateEmailDto: UpdateEmailDtoType) {
    const { code, token, userId } = updateEmailDto;

    const existingUser = await this.usersService.findById({ id: userId });

    if (!existingUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const existingValidEmailVerification =
      await this.emailVerificationService.findById({ id: token });

    if (!existingValidEmailVerification) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message:
          "You have no email verification in process. Please go back and try again",
      });
    }

    const { message } = await this.verifyEmailVerificationCode({
      code,
      id: token,
    });

    const updatedUser = await this.usersService.update({
      id: userId,
      email: existingValidEmailVerification.email,
    });

    // delete the email verification associated
    await this.emailVerificationService.delete({
      id: token,
    });

    return {
      message: `${message}. Your email has been updated to ${updatedUser.email}`,
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
      RedirectToGoogleDto,
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
        throw new InternalServerErrorException(
          "Failed to fetch Google user info",
        );
      }

      const body = await googleRes.json();

      const googleUser = GoogleUserSchema.parse(body);
      const existingUser = await this.usersService.findByGoogleEmail({
        googleEmail: googleUser.email,
      });

      const user: { userId: string; email: string } = { userId: "", email: "" };

      if (existingUser) {
        const { email } = await this.usersService.update({
          id: existingUser.id,
          googleId: googleUser.id,
          googleEmail: googleUser.email,
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

  async redirectToGoogleForLinking(
    redirectToGoogleForLinkingDto: RedirectToGoogleForLinkingDtoType,
  ) {
    const { state, response } = redirectToGoogleForLinkingDto;

    const googleUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.envService.get("GOOGLE_CLIENT_ID")}&` +
      `redirect_uri=${encodeURIComponent(this.envService.get("GOOGLE_LINKING_REDIRECT_URI"))}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `state=${encodeURIComponent(state)}`;

    response.redirect(googleUrl);
  }

  async handleGoogleLinkingCallBack(
    handleGoogleLinkingCallBackDto: HandleGoogleLinkingCallBackDtoType,
  ) {
    const { request, response, type } = handleGoogleLinkingCallBackDto;
    const userId = request.user.sub;

    const returnUrl = validateStateQueryParam(
      request,
      this.envService.get("NODE_ENV"),
      RedirectToGoogleForLinkingDto,
    );

    const url = new URL(returnUrl);
    const errorUrl = new URL(`${returnUrl}/profile`);

    if (type === "error") {
      handleErrorResponse({
        url: errorUrl,
        error: handleGoogleLinkingCallBackDto.error,
        errorDescription:
          "Something went wrong during the authentication process. Please try again",
        response,
      });

      return;
    }

    const code = handleGoogleLinkingCallBackDto.code;

    const client = new OAuth2Client({
      clientId: this.envService.get("GOOGLE_CLIENT_ID"),
      clientSecret: this.envService.get("GOOGLE_CLIENT_SECRET"),
      redirectUri: this.envService.get("GOOGLE_LINKING_REDIRECT_URI"),
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
        throw new InternalServerErrorException(
          "Failed to fetch Google user info",
        );
      }

      const body = await googleRes.json();

      const googleUser = GoogleUserSchema.parse(body);
      const existingGoogleUser = await this.usersService.findByGoogleEmail({
        googleEmail: googleUser.email,
      });

      if (existingGoogleUser) {
        throw new UnauthorizedException(
          "You have already linked this Google account",
        );
      }

      const existingEmailPlusPasswordUser = await this.usersService.findById({
        id: userId,
      });

      if (!existingEmailPlusPasswordUser) {
        throw new NotFoundException("User not found");
      }

      if (
        existingEmailPlusPasswordUser.authMethod === "both" ||
        existingEmailPlusPasswordUser.authMethod === "google"
      ) {
        throw new UnauthorizedException(
          "You have already linked a Google account",
        );
      }

      await this.usersService.update({
        id: existingEmailPlusPasswordUser.id,
        profilePicture: googleUser.picture,
        googleId: googleUser.id,
        googleEmail: googleUser.email,
        authMethod: "both",
      });

      const payload: Pick<JwtPayloadDtoType, "sub"> = {
        sub: existingEmailPlusPasswordUser.id,
      };
      const token = await this.jwtService.signAsync(payload);

      response.cookie(this.AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: this.COOKIE_MAX_AGE,
      });

      response.redirect(url.toString());
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
