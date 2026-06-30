import { Request, Response } from "express";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { EnvModule } from "@/env/env.module";
import { TrpcModule } from "@/trpc/trpc.module";
import { TrpcService } from "@/trpc/trpc.service";
import { Test } from "@nestjs/testing";
import { Procedure } from "@vitest/spy";

import { AuthRouter } from "./auth.router";
import { AuthService } from "./auth.service";

describe("AuthRouter", async () => {
  let authRouter: AuthRouter;
  let trpcService: TrpcService;

  let authService: {
    signIn: Mock<Procedure>;
    createEmailVerification: Mock<Procedure>;
    verifyEmailVerificationCode: Mock<Procedure>;
    register: Mock<Procedure>;
    createPasswordReset: Mock<Procedure>;
    verifyPasswordResetCode: Mock<Procedure>;
    resetPassword: Mock<Procedure>;
    checkAuthStatus: Mock<Procedure>;
    getUser: Mock<Procedure>;
    updateUsername: Mock<Procedure>;
    createEmailUpdate: Mock<Procedure>;
    updateEmail: Mock<Procedure>;
    deleteAccount: Mock<Procedure>;
  };

  const mockedCtx = {
    req: {
      headers: {
        "x-forwarded-for": "",
      } as Record<string, string>,
    } as Request,

    res: {
      cookie: vi.fn() as Function,
      clearCookie: vi.fn() as Function,
    } as Response,
  };

  const mockedPayload = {
    sub: "01kv1aqeffy49vc8bzq19nwvhh",
    iat: 1780458967,
    exp: 1782878167,
  };

  let caller: ReturnType<
    ReturnType<AuthRouter["procedures"]>["auth"]["createCaller"]
  >;

  beforeEach(async () => {
    vi.clearAllMocks();

    authService = {
      signIn: vi.fn(),
      createEmailVerification: vi.fn(),
      verifyEmailVerificationCode: vi.fn(),
      register: vi.fn(),
      createPasswordReset: vi.fn(),
      verifyPasswordResetCode: vi.fn(),
      resetPassword: vi.fn(),
      checkAuthStatus: vi.fn(),
      getUser: vi.fn(),
      updateUsername: vi.fn(),
      createEmailUpdate: vi.fn(),
      updateEmail: vi.fn(),
      deleteAccount: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [TrpcModule, EnvModule],
      providers: [
        AuthRouter,
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    authRouter = moduleRef.get(AuthRouter);
    trpcService = moduleRef.get(TrpcService);

    caller = trpcService.trpc.createCallerFactory(authRouter.procedures().auth)(
      mockedCtx,
    );
    vi.spyOn(trpcService, "getPayload").mockResolvedValue(mockedPayload);
  });

  describe("signIn", () => {
    const mockedEntry = {
      email: "test@test.com",
      password: "password123",
    };

    const mockedOutput = {
      accessToken: "token",
    };

    it("should call the signIn method of the authService", async () => {
      authService.signIn.mockResolvedValue(mockedOutput);

      await caller.signIn(mockedEntry);

      expect(authService.signIn).toHaveBeenCalled();
      expect(authService.signIn).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return an access token", async () => {
      authService.signIn.mockResolvedValue(mockedOutput);

      const { accessToken } = await caller.signIn(mockedEntry);

      expect(accessToken).toBeDefined();
      expect(accessToken).toEqual(mockedOutput.accessToken);
    });

    it("should set a cookie with the proper parameters in the response", async () => {
      authService.signIn.mockResolvedValue(mockedOutput);

      await caller.signIn(mockedEntry);

      expect(mockedCtx.res.cookie).toHaveBeenCalled();
      expect(mockedCtx.res.cookie).toHaveBeenCalledWith(
        expect.anything(),
        mockedOutput.accessToken,
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "none",
        }),
      );
    });
  });

  describe("createEmailVerification", () => {
    const mockedEntry = {
      email: "test@email.test",
      type: "onboarding" as const,
    };

    const mockedOutput = {
      verificationToken: "ZUSTAND8",
      message: "Verification code sent",
    };

    it("should call the createEmailVerification method of the authService", async () => {
      authService.createEmailVerification.mockResolvedValue(mockedOutput);

      await caller.createEmailVerification(mockedEntry);

      expect(authService.createEmailVerification).toHaveBeenCalled();
      expect(authService.createEmailVerification).toHaveBeenCalledWith(
        mockedEntry,
      );
    });

    it("should return a verification token", async () => {
      authService.createEmailVerification.mockResolvedValue(mockedOutput);

      const { verificationToken } =
        await caller.createEmailVerification(mockedEntry);

      expect(verificationToken).toBeDefined();
      expect(verificationToken).toEqual(mockedOutput.verificationToken);
    });

    it("should return a message", async () => {
      authService.createEmailVerification.mockResolvedValue(mockedOutput);

      const { message } = await caller.createEmailVerification(mockedEntry);

      expect(message).toBeDefined();
      expect(message).toEqual(mockedOutput.message);
    });
  });

  describe("verifyEmailVerificationCode", () => {
    const mockedEntry = {
      id: "01kv16vngjd0pmsbmwnv3nb41p",
      code: "ZUSTAND8",
    };

    const mockedOutput = {
      message: "Code verified",
    };

    it("should call the verifyEmailVerificationCode method of the authService", async () => {
      authService.verifyEmailVerificationCode.mockResolvedValue(mockedOutput);

      await caller.verifyEmailVerificationCode(mockedEntry);

      expect(authService.verifyEmailVerificationCode).toHaveBeenCalled();
      expect(authService.verifyEmailVerificationCode).toHaveBeenCalledWith(
        mockedEntry,
      );
    });

    it("should return a message", async () => {
      authService.verifyEmailVerificationCode.mockResolvedValue(mockedOutput);

      const { message } = await caller.verifyEmailVerificationCode(mockedEntry);

      expect(message).toBeDefined();
      expect(message).toEqual(mockedOutput.message);
    });
  });

  describe("register", () => {
    const mockedEntry = {
      token: "01kv16vngjd0pmsbmwnv3nb41p",
      username: "test",
      password: "password",
    };

    const mockedOutput = { accessToken: "token", email: "test@email.email" };

    it("should call the register method of the authService", async () => {
      authService.register.mockResolvedValue(mockedOutput);

      await caller.register(mockedEntry);

      expect(authService.register).toHaveBeenCalled();
      expect(authService.register).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return an access token", async () => {
      authService.register.mockResolvedValue(mockedOutput);

      const { accessToken } = await caller.register(mockedEntry);

      expect(accessToken).toBeDefined();
      expect(accessToken).toEqual(mockedOutput.accessToken);
    });

    it("should return the email of the user", async () => {
      authService.register.mockResolvedValue(mockedOutput);

      const { email } = await caller.register(mockedEntry);

      expect(email).toBeDefined();
      expect(email).toEqual(mockedOutput.email);
    });

    it("should set a cookie with the proper parameters in the response", async () => {
      authService.register.mockResolvedValue(mockedOutput);

      await caller.register(mockedEntry);

      expect(mockedCtx.res.cookie).toHaveBeenCalled();
      expect(mockedCtx.res.cookie).toHaveBeenCalledWith(
        expect.anything(),
        mockedOutput.accessToken,
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "none",
        }),
      );
    });
  });

  describe("createPasswordReset", () => {
    const mockedEntry = {
      email: "test@email.test",
    };

    const mockedOutput = {
      passwordResetToken: "01kv16vngjd0pmsbmwnv3nb41p",
      message: "Verification code sent",
    };

    it("should call the createPasswordReset method of the authService", async () => {
      authService.createPasswordReset.mockResolvedValue(mockedOutput);

      await caller.createPasswordReset(mockedEntry);

      expect(authService.createPasswordReset).toHaveBeenCalled();
      expect(authService.createPasswordReset).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return a password reset token", async () => {
      authService.createPasswordReset.mockResolvedValue(mockedOutput);

      const { passwordResetToken } =
        await caller.createPasswordReset(mockedEntry);

      expect(passwordResetToken).toBeDefined();
      expect(passwordResetToken).toEqual(mockedOutput.passwordResetToken);
    });

    it("should return a message", async () => {
      authService.createPasswordReset.mockResolvedValue(mockedOutput);

      const { message } = await caller.createPasswordReset(mockedEntry);

      expect(message).toBeDefined();
      expect(message).toEqual(mockedOutput.message);
    });
  });

  describe("verifyPasswordResetCode", () => {
    const mockedEntry = {
      id: "01kv16vngjd0pmsbmwnv3nb41p",
      code: "ZUSTAND8",
    };

    const mockedOutput = {
      message: "Code verified",
    };

    it("should call the verifyPasswordResetCode method of the authService", async () => {
      authService.verifyPasswordResetCode.mockResolvedValue(mockedOutput);

      await caller.verifyPasswordResetCode(mockedEntry);

      expect(authService.verifyPasswordResetCode).toHaveBeenCalled();
      expect(authService.verifyPasswordResetCode).toHaveBeenCalledWith(
        mockedEntry,
      );
    });

    it("should return a message", async () => {
      authService.verifyPasswordResetCode.mockResolvedValue(mockedOutput);

      const { message } = await caller.verifyPasswordResetCode(mockedEntry);

      expect(message).toBeDefined();
      expect(message).toEqual(mockedOutput.message);
    });
  });

  describe("resetPassword", () => {
    const mockedEntry = {
      token: "01kv16vngjd0pmsbmwnv3nb41p",
      newPassword: "password",
    };

    const mockedOutput = {
      accessToken: "token",
      email: "test@email.email",
      message: "Password reset successfully",
    };

    it("should call the resetPassword method of the authService", async () => {
      authService.resetPassword.mockResolvedValue(mockedOutput);

      await caller.resetPassword(mockedEntry);

      expect(authService.resetPassword).toHaveBeenCalled();
      expect(authService.resetPassword).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return an access token", async () => {
      authService.resetPassword.mockResolvedValue(mockedOutput);

      const { accessToken } = await caller.resetPassword(mockedEntry);

      expect(accessToken).toBeDefined();
      expect(accessToken).toEqual(mockedOutput.accessToken);
    });

    it("should return the email of the user", async () => {
      authService.resetPassword.mockResolvedValue(mockedOutput);

      const { email } = await caller.resetPassword(mockedEntry);

      expect(email).toBeDefined();
      expect(email).toEqual(mockedOutput.email);
    });

    it("should return a message", async () => {
      authService.resetPassword.mockResolvedValue(mockedOutput);

      const { message } = await caller.resetPassword(mockedEntry);

      expect(message).toBeDefined();
      expect(message).toEqual(mockedOutput.message);
    });

    it("should set a cookie with the proper parameters in the response", async () => {
      authService.resetPassword.mockResolvedValue(mockedOutput);

      await caller.resetPassword(mockedEntry);

      expect(mockedCtx.res.cookie).toHaveBeenCalled();
      expect(mockedCtx.res.cookie).toHaveBeenCalledWith(
        expect.anything(),
        mockedOutput.accessToken,
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "none",
        }),
      );
    });
  });

  describe("checkAuthStatus", () => {
    const mockedEntry = {
      user: { sub: mockedPayload.sub },
    };

    const mockedOutput = {
      isAuthenticated: true,
      user: mockedEntry,
    };

    it("should call the checkAuthStatus method of the authService", async () => {
      authService.checkAuthStatus.mockResolvedValue(mockedOutput);

      await caller.checkAuthStatus();

      expect(authService.checkAuthStatus).toHaveBeenCalled();
      expect(authService.checkAuthStatus).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return the authentication status of the user", async () => {
      authService.checkAuthStatus.mockResolvedValue(mockedOutput);

      const { isAuthenticated } = await caller.checkAuthStatus();

      expect(isAuthenticated).toBeDefined();
      expect(isAuthenticated).toEqual(true);
    });

    it("should return the user sub", async () => {
      authService.checkAuthStatus.mockResolvedValue(mockedOutput);

      const { user } = await caller.checkAuthStatus();

      expect(user).toBeDefined();
      expect(user).toEqual(mockedOutput.user);
    });
  });

  describe("getUser", () => {
    const mockedEntry = {
      user: { sub: mockedPayload.sub },
    };

    const mockedOutput = {
      email: "test@email.test",
      username: "test",
      id: "1",
      profilePicture: "picture",
      authMethod: "email",
      registrationDate: new Date(),
    };

    it("should call the getUser method of the authService", async () => {
      authService.getUser.mockResolvedValue(mockedOutput);

      await caller.getUser();

      expect(authService.getUser).toHaveBeenCalled();
      expect(authService.getUser).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return the user", async () => {
      authService.getUser.mockResolvedValue(mockedOutput);

      const user = await caller.getUser();

      expect(user).toBeDefined();
      expect(user).toEqual(mockedOutput);
    });
  });

  describe("updateUsername", () => {
    const mockedEntry = {
      username: "test",
      userId: mockedPayload.sub,
    };

    const mockedOutput = {
      email: "test@email.test",
      username: "test",
    };

    it("should call the updateUsername method of the authService", async () => {
      authService.updateUsername.mockResolvedValue(mockedOutput);

      await caller.updateUsername(mockedEntry);

      expect(authService.updateUsername).toHaveBeenCalled();
      expect(authService.updateUsername).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return the email of the user", async () => {
      authService.updateUsername.mockResolvedValue(mockedOutput);

      const { email } = await caller.updateUsername(mockedEntry);

      expect(email).toBeDefined();
      expect(email).toEqual(mockedOutput.email);
    });

    it("should return the new username of the user", async () => {
      authService.updateUsername.mockResolvedValue(mockedOutput);

      const { username } = await caller.updateUsername(mockedEntry);

      expect(username).toBeDefined();
      expect(username).toEqual(mockedOutput.username);
    });
  });

  describe("createEmailUpdate", () => {
    const mockedEntry = {
      email: "test@email.test",
      userId: mockedPayload.sub,
    };

    const mockedOutput = {
      verificationToken: "ZUSTAND8",
      message: "Verification code sent",
    };

    it("should call the createEmailUpdate method of the authService", async () => {
      authService.createEmailUpdate.mockResolvedValue(mockedOutput);

      await caller.createEmailUpdate(mockedEntry);

      expect(authService.createEmailUpdate).toHaveBeenCalled();
      expect(authService.createEmailUpdate).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return a verification token", async () => {
      authService.createEmailUpdate.mockResolvedValue(mockedOutput);

      const { verificationToken } = await caller.createEmailUpdate(mockedEntry);

      expect(verificationToken).toBeDefined();
      expect(verificationToken).toEqual(mockedOutput.verificationToken);
    });

    it("should return a message", async () => {
      authService.createEmailUpdate.mockResolvedValue(mockedOutput);

      const { message } = await caller.createEmailUpdate(mockedEntry);

      expect(message).toBeDefined();
      expect(message).toEqual(mockedOutput.message);
    });
  });

  describe("updateEmail", () => {
    const mockedEntry = {
      token: "01kv16vngjd0pmsbmwnv3nb41p",
      code: "ZUSTAND8",
      userId: mockedPayload.sub,
    };

    const mockedOutput = {
      message: "Email updated",
    };

    it("should call the updateEmail method of the authService", async () => {
      authService.updateEmail.mockResolvedValue(mockedOutput);

      await caller.updateEmail(mockedEntry);

      expect(authService.updateEmail).toHaveBeenCalled();
      expect(authService.updateEmail).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return a message", async () => {
      authService.updateEmail.mockResolvedValue(mockedOutput);

      const { message } = await caller.updateEmail(mockedEntry);

      expect(message).toBeDefined();
      expect(message).toEqual(mockedOutput.message);
    });
  });

  describe("logOut", () => {
    it("should remove the cookie", async () => {
      await caller.logOut();

      expect(mockedCtx.res.clearCookie).toHaveBeenCalled();
      expect(mockedCtx.res.clearCookie).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "none",
        }),
      );
    });
  });

  describe("deleteAccount", () => {
    const mockedEntry = {
      userId: mockedPayload.sub,
    };

    const mockedOutput = {
      message: "Email updated",
    };

    it("should call the deleteAccount method of the authService", async () => {
      authService.deleteAccount.mockResolvedValue(mockedOutput);

      await caller.deleteAccount();

      expect(authService.deleteAccount).toHaveBeenCalled();
      expect(authService.deleteAccount).toHaveBeenCalledWith(mockedEntry);
    });

    it("should remove the cookie", async () => {
      authService.deleteAccount.mockResolvedValue(mockedOutput);

      await caller.deleteAccount();

      expect(mockedCtx.res.clearCookie).toHaveBeenCalled();
      expect(mockedCtx.res.clearCookie).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "none",
        }),
      );
    });
  });
});
