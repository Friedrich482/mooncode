import * as bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { EmailService } from "@/email/email.service";
import { EmailVerificationsService } from "@/email-verifications/email-verifications.service";
import { EnvService } from "@/env/env.service";
import { PasswordResetsService } from "@/password-resets/password-resets.service";
import { UsersService } from "@/users/users.service";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { EXTENSION_ID, PUBLISHER } from "@repo/common/constants";
import { TRPCError } from "@trpc/server";
import { Procedure } from "@vitest/spy";

import { AuthService } from "./auth.service";
import {
  LINKING_GOOGLE_ACCOUNT_OAUTH_CLIENT_PROVIDER,
  LOGIN_GOOGLE_OAUTH_CLIENT_PROVIDER,
} from "./constants";

describe("AuthService", () => {
  let authService: AuthService;

  let usersService: {
    findByEmail: Mock<Procedure>;
    findByGoogleEmail: Mock<Procedure>;
    findById: Mock<Procedure>;
    findByUsername: Mock<Procedure>;
    create: Mock<Procedure>;
    createGoogleUser: Mock<Procedure>;
    update: Mock<Procedure>;
    delete: Mock<Procedure>;
  };
  let jwtService: { signAsync: Mock<Procedure> };
  let envService: { get: Mock<Procedure> };
  let emailService: { sendEmail: Mock<Procedure> };
  let emailVerificationService: {
    create: Mock<Procedure>;
    verifyCode: Mock<Procedure>;
    findById: Mock<Procedure>;
    delete: Mock<Procedure>;
  };
  let passwordResetsService: {
    create: Mock<Procedure>;
    verifyCode: Mock<Procedure>;
    findById: Mock<Procedure>;
    delete: Mock<Procedure>;
  };
  let loginGoogleOauthClient: {
    getToken: Mock<Procedure>;
  };
  let linkingGoogleAccountOauthClient: {
    getToken: Mock<Procedure>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    envService = {
      get: vi.fn(),
    };

    jwtService = {
      signAsync: vi.fn(),
    };

    usersService = {
      create: vi.fn(),
      createGoogleUser: vi.fn(),
      findByEmail: vi.fn(),
      findByGoogleEmail: vi.fn(),
      findById: vi.fn(),
      findByUsername: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    emailService = {
      sendEmail: vi.fn(),
    };

    emailVerificationService = {
      findById: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      verifyCode: vi.fn(),
    };

    passwordResetsService = {
      findById: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      verifyCode: vi.fn(),
    };

    loginGoogleOauthClient = {
      getToken: vi.fn(),
    };

    linkingGoogleAccountOauthClient = {
      getToken: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: EnvService,
          useValue: envService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: EmailService,
          useValue: emailService,
        },
        {
          provide: EmailVerificationsService,
          useValue: emailVerificationService,
        },
        {
          provide: PasswordResetsService,
          useValue: passwordResetsService,
        },
        {
          provide: LOGIN_GOOGLE_OAUTH_CLIENT_PROVIDER,
          useValue: loginGoogleOauthClient,
        },
        {
          provide: LINKING_GOOGLE_ACCOUNT_OAUTH_CLIENT_PROVIDER,
          useValue: linkingGoogleAccountOauthClient,
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  describe("signIn", () => {
    const email = "test@email.test";

    const mockedEntry = {
      email,
      password: "password",
    };
    const mockedToken = "token";

    it("should return an access token", async () => {
      const mockedUser = {
        email,
        username: "user",
        id: "1",
        profilePicture: "picture",
        hashedPassword: "hashed_password",
      };

      usersService.findByEmail.mockResolvedValue(mockedUser);

      vi.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
      jwtService.signAsync.mockResolvedValue(mockedToken);

      const accessToken = await authService.signIn(mockedEntry);

      expect(accessToken).toBeDefined();
      expect(accessToken).toEqual({ accessToken: mockedToken });
    });

    it("should throw an error if there is no user with the email provided", async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const error = await authService.signIn(mockedEntry).catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error).property("message").match(/user/i);
    });

    it("should throw an error if the password provided doesn't match the hashed password", async () => {
      const mockedUser = {
        email,
        username: "user",
        id: "1",
        profilePicture: "picture",
        hashedPassword: "hashed_password",
      };

      usersService.findByEmail.mockResolvedValue(mockedUser);
      vi.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

      const error = await authService.signIn(mockedEntry).catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("UNAUTHORIZED");
      expect(error)
        .property("message")
        .match(/password/i);
    });

    it("should compare the password to the hashed password", async () => {
      const mockedUser = {
        email,
        username: "user",
        id: "1",
        profilePicture: "picture",
        hashedPassword: "hashed_password",
      };

      usersService.findByEmail.mockResolvedValue(mockedUser);

      const compareSpy = vi.spyOn(bcrypt, "compare");

      compareSpy.mockResolvedValue(true as never);
      jwtService.signAsync.mockResolvedValue(mockedToken);

      await authService.signIn(mockedEntry);

      expect(compareSpy).toHaveBeenCalled();
      expect(compareSpy).toHaveBeenCalledWith(
        mockedEntry.password,
        mockedUser.hashedPassword,
      );
    });
  });

  describe("createEmailVerification", () => {
    it.each(["onboarding", "email update"] as const)(
      "should call the create method of the EmailVerificationService",
      (type) => {
        const mockedEntry = {
          email: "test@email.test",
          type,
        };

        authService.createEmailVerification(mockedEntry);

        expect(emailVerificationService.create).toHaveBeenCalled();
        expect(emailVerificationService.create).toHaveBeenCalledWith(
          mockedEntry,
        );
      },
    );
  });

  describe("verifyEmailVerificationCode", () => {
    it("should call the verifyCode method of the EmailVerificationService", () => {
      const mockedEntry = {
        id: "1",
        code: "ZUSTAND8",
      };

      authService.verifyEmailVerificationCode(mockedEntry);

      expect(emailVerificationService.verifyCode).toHaveBeenCalled();
      expect(emailVerificationService.verifyCode).toHaveBeenCalledWith(
        mockedEntry,
      );
    });
  });

  describe("register", () => {
    const email = "test@email.test";
    const username = "user";
    const mockedEntry = {
      token: "1",
      password: "password",
      username,
    };

    const mockedToken = "token";

    it("should return an access token", async () => {
      emailVerificationService.findById.mockResolvedValue({
        email,
        id: "2",
        verifiedAt: new Date(),
      });

      usersService.create.mockResolvedValue({
        id: "3",
        email,
        username,
      });

      jwtService.signAsync.mockResolvedValue(mockedToken);

      const { accessToken } = await authService.register(mockedEntry);

      expect(accessToken).toBeDefined();
      expect(accessToken).toEqual(mockedToken);
    });

    it("should return the email of the created user", async () => {
      emailVerificationService.findById.mockResolvedValue({
        email,
        id: "2",
        verifiedAt: new Date(),
      });

      usersService.create.mockResolvedValue({
        id: "3",
        email,
        username,
      });

      jwtService.signAsync.mockResolvedValue(mockedToken);

      const { email: registeredUserEmail } =
        await authService.register(mockedEntry);

      expect(registeredUserEmail).toBeDefined();
      expect(registeredUserEmail).toEqual(email);
    });

    it("should delete the email verification associated", async () => {
      emailVerificationService.findById.mockResolvedValue({
        email,
        id: "2",
        verifiedAt: new Date(),
      });

      usersService.create.mockResolvedValue({
        id: "3",
        email,
        username,
      });

      jwtService.signAsync.mockResolvedValue(mockedToken);

      await authService.register(mockedEntry);

      expect(emailVerificationService.delete).toHaveBeenCalled();
      expect(emailVerificationService.delete).toHaveBeenCalledWith({
        id: mockedEntry.token,
      });
    });

    it("should throw an error when there is no email verification matching", async () => {
      emailVerificationService.findById.mockResolvedValue(null);

      const error = await authService.register(mockedEntry).catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error)
        .property("message")
        .match(/email verification/i)
        .match(/try again/i);
    });

    it("should throw an error when the email is not verified", async () => {
      emailVerificationService.findById.mockResolvedValue({
        email,
        id: "2",
        verifiedAt: null,
      });

      const error = await authService.register(mockedEntry).catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("UNAUTHORIZED");
      expect(error)
        .property("message")
        .match(/email/i)
        .match(/registration/i);
    });
  });

  describe("createPasswordReset", () => {
    it("should call the create method of the passwordResetsService", () => {
      const mockedEntry = {
        email: "test@email.test",
      };

      authService.createPasswordReset(mockedEntry);

      expect(passwordResetsService.create).toHaveBeenCalled();
      expect(passwordResetsService.create).toHaveBeenCalledWith(mockedEntry);
    });
  });

  describe("verifyPasswordResetCode", () => {
    it("should call the verifyCode method of the passwordResetsService", () => {
      const mockedEntry = {
        id: "1",
        code: "ZUSTAND8",
      };

      authService.verifyPasswordResetCode(mockedEntry);

      expect(passwordResetsService.verifyCode).toHaveBeenCalled();
      expect(passwordResetsService.verifyCode).toHaveBeenCalledWith(
        mockedEntry,
      );
    });
  });

  describe("resetPassword", () => {
    const mockedEntry = {
      token: "1",
      newPassword: "new_password",
    };
    const email = "test@email.test";

    it("should return an access token", async () => {
      const mockedToken = "token";

      passwordResetsService.findById.mockResolvedValue({
        email,
        code: "ZUSTAND8",
      });

      usersService.findByEmail.mockResolvedValue({
        email,
        username: "user",
        id: "2",
        profilePicture: "picture",
        hashedPassword: "hashed_password",
      });

      jwtService.signAsync.mockResolvedValue(mockedToken);

      const { accessToken } = await authService.resetPassword(mockedEntry);

      expect(accessToken).toBeDefined();
      expect(accessToken).toEqual(mockedToken);
    });

    it("should return the email of the user", async () => {
      passwordResetsService.findById.mockResolvedValue({
        email,
        code: "ZUSTAND8",
      });

      usersService.findByEmail.mockResolvedValue({
        email,
        username: "user",
        id: "2",
        profilePicture: "picture",
        hashedPassword: "hashed_password",
      });

      const { email: userEmail } = await authService.resetPassword(mockedEntry);

      expect(userEmail).toBeDefined();
      expect(userEmail).toEqual(email);
    });

    it("should return a message confirming that the email has been reset", async () => {
      passwordResetsService.findById.mockResolvedValue({
        email,
        code: "ZUSTAND8",
      });

      usersService.findByEmail.mockResolvedValue({
        email,
        username: "user",
        id: "2",
        profilePicture: "picture",
        hashedPassword: "hashed_password",
      });

      const { message } = await authService.resetPassword(mockedEntry);

      expect(message).toBeDefined();
      expect(message).toMatch(/password reset/i);
    });

    it("should verify that the code is still valid", async () => {
      passwordResetsService.findById.mockResolvedValue({
        email,
        code: "ZUSTAND8",
      });

      usersService.findByEmail.mockResolvedValue({
        email,
        username: "user",
        id: "2",
        profilePicture: "picture",
        hashedPassword: "hashed_password",
      });

      await authService.resetPassword(mockedEntry);

      expect(passwordResetsService.verifyCode).toHaveBeenCalled();
      expect(passwordResetsService.verifyCode).toHaveBeenCalledWith({
        code: "ZUSTAND8",
        id: mockedEntry.token,
      });
    });

    it("should delete the associated password reset", async () => {
      passwordResetsService.findById.mockResolvedValue({
        email,
        code: "ZUSTAND8",
      });

      usersService.findByEmail.mockResolvedValue({
        email,
        username: "user",
        id: "2",
        profilePicture: "picture",
        hashedPassword: "hashed_password",
      });

      await authService.resetPassword(mockedEntry);

      expect(passwordResetsService.delete).toHaveBeenCalled();
      expect(passwordResetsService.delete).toHaveBeenCalledWith({
        id: mockedEntry.token,
      });
    });

    it("should update the user information with the new password", async () => {
      passwordResetsService.findById.mockResolvedValue({
        email,
        code: "ZUSTAND8",
      });

      usersService.findByEmail.mockResolvedValue({
        email,
        username: "user",
        id: "2",
        profilePicture: "picture",
        hashedPassword: "hashed_password",
      });

      await authService.resetPassword(mockedEntry);

      expect(usersService.update).toHaveBeenCalled();
      expect(usersService.update).toHaveBeenCalledWith({
        id: "2",
        password: mockedEntry.newPassword,
      });
    });

    it("should throw an error when there is no existing password reset", async () => {
      passwordResetsService.findById.mockResolvedValue(null);

      const error = await authService
        .resetPassword(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error)
        .property("message")
        .match(/password reset/i)
        .match(/try again/i);
    });

    it("should throw an error when there is no user associated to the password reset", async () => {
      passwordResetsService.findById.mockResolvedValue({
        email,
        code: "ZUSTAND8",
      });

      usersService.findByEmail.mockResolvedValue(null);

      const error = await authService
        .resetPassword(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error).property("message").match(/user/i);
    });
  });

  describe("checkAuthStatus", () => {
    it("should confirm that the user is authenticated", async () => {
      const mockedEntry = {
        user: {
          sub: "1",
        },
      };

      const { isAuthenticated } =
        await authService.checkAuthStatus(mockedEntry);

      expect(isAuthenticated).toBeDefined();
      expect(isAuthenticated).toBe(true);
    });

    it("should return the user sub", async () => {
      const mockedEntry = {
        user: {
          sub: "1",
        },
      };

      const { user } = await authService.checkAuthStatus(mockedEntry);

      expect(user).toBeDefined();
      expect(user).toEqual(mockedEntry.user);
    });
  });

  describe("getUser", () => {
    const userId = "1";
    const mockedEntry = {
      user: { sub: userId },
    };

    it("should return the user information", async () => {
      const mockedUser = {
        email: "test@email.test",
        username: "user",
        id: userId,
        profilePicture: "picture",
        authMethod: "email",
        registrationDate: new Date(),
      };

      usersService.findById.mockResolvedValue(mockedUser);

      const user = await authService.getUser(mockedEntry);

      expect(user).toBeDefined();
      expect(user).toEqual(mockedUser);
    });

    it("should throw an error if there is no user found", async () => {
      usersService.findById.mockResolvedValue(null);

      const error = await authService.getUser(mockedEntry).catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error).property("message").match(/user/i);
    });
  });

  describe("updateUsername", () => {
    const userId = "1";
    const newUsername = "newUsername";
    const mockedEntry = {
      userId,
      username: newUsername,
    };

    it("should return the updated user information", async () => {
      const mockedUser = {
        email: "test@email.test",
        username: "oldUsername",
        id: userId,
        profilePicture: "picture",
        authMethod: "email",
        registrationDate: new Date(),
      };

      const mockedResult = { username: newUsername, email: mockedUser.email };

      usersService.findById.mockResolvedValue(mockedUser);
      usersService.findByUsername.mockResolvedValue(null);
      usersService.update.mockResolvedValue(mockedResult);

      const user = await authService.updateUsername(mockedEntry);

      expect(user).toBeDefined();
      expect(user).toEqual(mockedResult);
    });

    it("should throw an error if the user doesn't exists", async () => {
      usersService.findById.mockResolvedValue(null);

      const error = await authService
        .updateUsername(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error).property("message").match(/user/i);
    });

    it("should throw an error if the old username is equal to the new one", async () => {
      const oldUsername = "oldUsername";
      const newUsername = "newUsername";

      const mockedUser = {
        email: "test@email.test",
        username: oldUsername,
        id: userId,
        profilePicture: "picture",
        authMethod: "email",
        registrationDate: new Date(),
      };

      usersService.findById.mockResolvedValue(mockedUser);
      usersService.findByUsername.mockResolvedValue({
        email: "test@email.test",
        username: newUsername,
        id: "1",
      });

      const error = await authService
        .updateUsername(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("CONFLICT");
      expect(error)
        .property("message")
        .match(/username/i)
        .match(/changed/i);
    });

    it("should throw an error if there is a user different from the current user that has this username", async () => {
      const oldUsername = "oldUsername";
      const newUsername = "newUsername";

      const mockedUser = {
        email: "test@email.test",
        username: oldUsername,
        id: userId,
        profilePicture: "picture",
        authMethod: "email",
        registrationDate: new Date(),
      };

      usersService.findById.mockResolvedValue(mockedUser);
      usersService.findByUsername.mockResolvedValue({
        email: "other@email.test",
        username: newUsername,
        id: "2",
      });

      const error = await authService
        .updateUsername(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("CONFLICT");
      expect(error)
        .property("message")
        .match(/username/i)
        .match(/taken/i);
    });
  });

  describe("createEmailUpdate", () => {
    const newEmail = "new@email.test";
    const oldEmail = "old@email.test";
    const userId = "1";
    const mockedEntry = {
      userId,
      email: newEmail,
    };

    it("should return a verification token", async () => {
      usersService.findById.mockResolvedValue({
        email: oldEmail,
        username: "user",
        id: userId,
        profilePicture: "picture",
        authMethod: "email",
        registrationDate: new Date(),
      });

      usersService.findByEmail.mockResolvedValue(null);

      const mockedCreatedEmailVerification = {
        message: "Verification code sent",
        verificationToken: "2",
      };

      vi.spyOn(authService, "createEmailVerification").mockResolvedValue(
        mockedCreatedEmailVerification,
      );

      const { verificationToken } =
        await authService.createEmailUpdate(mockedEntry);

      expect(verificationToken).toBeDefined();
      expect(verificationToken).toEqual(
        mockedCreatedEmailVerification.verificationToken,
      );
    });

    it("should return a message confirming that the code has been sent", async () => {
      usersService.findById.mockResolvedValue({
        email: oldEmail,
        username: "user",
        id: userId,
        profilePicture: "picture",
        authMethod: "email",
        registrationDate: new Date(),
      });

      usersService.findByEmail.mockResolvedValue(null);

      const mockedCreatedEmailVerification = {
        message: "Verification code sent",
        verificationToken: "2",
      };

      vi.spyOn(authService, "createEmailVerification").mockResolvedValue(
        mockedCreatedEmailVerification,
      );

      const { message } = await authService.createEmailUpdate(mockedEntry);

      expect(message).toBeDefined();
      expect(message).toEqual(mockedCreatedEmailVerification.message);
    });

    it("should create an email verification for the new email", async () => {
      usersService.findById.mockResolvedValue({
        email: oldEmail,
        username: "user",
        id: userId,
        profilePicture: "picture",
        authMethod: "email",
        registrationDate: new Date(),
      });

      usersService.findByEmail.mockResolvedValue(null);

      const mockedCreatedEmailVerification = {
        message: "Verification code sent",
        verificationToken: "2",
      };

      const createEmailVerificationSpy = vi.spyOn(
        authService,
        "createEmailVerification",
      );

      createEmailVerificationSpy.mockResolvedValue(
        mockedCreatedEmailVerification,
      );

      await authService.createEmailUpdate(mockedEntry);

      expect(createEmailVerificationSpy).toHaveBeenCalled();
      expect(createEmailVerificationSpy).toHaveBeenCalledWith({
        email: newEmail,
        type: "email update",
      });
    });

    it("should send a notification email to the old email address", async () => {
      usersService.findById.mockResolvedValue({
        email: oldEmail,
        username: "user",
        id: userId,
        profilePicture: "picture",
        authMethod: "email",
        registrationDate: new Date(),
      });

      usersService.findByEmail.mockResolvedValue(null);

      const mockedCreatedEmailVerification = {
        message: "Verification code sent",
        verificationToken: "2",
      };

      vi.spyOn(authService, "createEmailVerification").mockResolvedValue(
        mockedCreatedEmailVerification,
      );

      await authService.createEmailUpdate(mockedEntry);

      expect(emailService.sendEmail).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        type: "notice email update",
        email: oldEmail,
      });
    });

    it("should throw an error if the user doesn't exists", async () => {
      usersService.findById.mockResolvedValue(null);

      const error = await authService
        .createEmailUpdate(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error).property("message").match(/user/i);
    });

    it("should throw an error if the new email is equal to the old one", async () => {
      usersService.findById.mockResolvedValue({
        email: oldEmail,
        username: "user",
        id: userId,
        profilePicture: "picture",
        authMethod: "email",
        registrationDate: new Date(),
      });

      usersService.findByEmail.mockResolvedValue({
        email: oldEmail,
        username: "user",
        id: userId,
        profilePicture: "picture",
        hashedPassword: "hashed_password",
      });

      const error = await authService
        .createEmailUpdate(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("CONFLICT");
      expect(error)
        .property("message")
        .match(/email/i)
        .match(/changed/i);
    });

    it("should throw an error if the new email is already taken by another user", async () => {
      usersService.findById.mockResolvedValue({
        email: oldEmail,
        username: "user",
        id: userId,
        profilePicture: "picture",
        authMethod: "email",
        registrationDate: new Date(),
      });

      usersService.findByEmail.mockResolvedValue({
        email: newEmail,
        username: "user",
        id: userId,
        profilePicture: "picture",
        hashedPassword: "hashed_password",
      });

      const error = await authService
        .createEmailUpdate(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("CONFLICT");
      expect(error).property("message").match(/email/i).match(/taken/i);
    });

    it("should throw an error if the auth method of the user is 'google'", async () => {
      usersService.findById.mockResolvedValue({
        email: oldEmail,
        username: "user",
        id: userId,
        profilePicture: "picture",
        authMethod: "google",
        registrationDate: new Date(),
      });

      usersService.findByEmail.mockResolvedValue(null);

      const error = await authService
        .createEmailUpdate(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("UNAUTHORIZED");
      expect(error)
        .property("message")
        .match(/email update/i)
        .match(/google account/i);
    });
  });

  describe("updateEmail", () => {
    const userId = "2";
    const oldEmail = "old@email.test";
    const newEmail = "new@email.test";
    const username = "user";
    const profilePicture = "picture";
    const mockedEntry = {
      code: "ZUSTAND8",
      token: "1",
      userId,
    };

    it("should return a message confirming that the user email has been updated", async () => {
      usersService.findById.mockResolvedValue({
        email: oldEmail,
        username,
        id: userId,
        profilePicture,
        authMethod: "email",
        registrationDate: new Date(),
      });

      emailVerificationService.findById.mockResolvedValue({
        email: newEmail,
        id: "3",
        verifiedAt: new Date(),
      });

      vi.spyOn(authService, "verifyEmailVerificationCode").mockResolvedValue({
        message: "Code verified",
      });

      usersService.update.mockResolvedValue({
        username,
        email: newEmail,
        profilePicture,
      });

      const { message } = await authService.updateEmail(mockedEntry);

      expect(message).toBeDefined();
      expect(message)
        .match(/Code verified/)
        .match(/updated/i)
        .match(new RegExp(newEmail));
    });

    it("should verify the email verification code", async () => {
      usersService.findById.mockResolvedValue({
        email: oldEmail,
        username,
        id: userId,
        profilePicture,
        authMethod: "email",
        registrationDate: new Date(),
      });

      emailVerificationService.findById.mockResolvedValue({
        email: newEmail,
        id: "3",
        verifiedAt: new Date(),
      });

      const verifyEmailVerificationCode = vi.spyOn(
        authService,
        "verifyEmailVerificationCode",
      );

      verifyEmailVerificationCode.mockResolvedValue({
        message: "Code verified",
      });

      usersService.update.mockResolvedValue({
        username,
        email: newEmail,
        profilePicture,
      });

      await authService.updateEmail(mockedEntry);

      expect(verifyEmailVerificationCode).toHaveBeenCalled();
      expect(verifyEmailVerificationCode).toHaveBeenCalledWith({
        code: mockedEntry.code,
        id: mockedEntry.token,
      });
    });

    it("should update the user with the new email", async () => {
      usersService.findById.mockResolvedValue({
        email: oldEmail,
        username,
        id: userId,
        profilePicture,
        authMethod: "email",
        registrationDate: new Date(),
      });

      emailVerificationService.findById.mockResolvedValue({
        email: newEmail,
        id: "3",
        verifiedAt: new Date(),
      });

      vi.spyOn(authService, "verifyEmailVerificationCode").mockResolvedValue({
        message: "Code verified",
      });

      usersService.update.mockResolvedValue({
        username,
        email: newEmail,
        profilePicture,
      });

      await authService.updateEmail(mockedEntry);

      expect(usersService.update).toHaveBeenCalled();
      expect(usersService.update).toHaveBeenCalledWith({
        id: userId,
        email: newEmail,
      });
    });

    it("should delete the email verification associated", async () => {
      usersService.findById.mockResolvedValue({
        email: oldEmail,
        username,
        id: userId,
        profilePicture,
        authMethod: "email",
        registrationDate: new Date(),
      });

      emailVerificationService.findById.mockResolvedValue({
        email: newEmail,
        id: "3",
        verifiedAt: new Date(),
      });

      vi.spyOn(authService, "verifyEmailVerificationCode").mockResolvedValue({
        message: "Code verified",
      });

      usersService.update.mockResolvedValue({
        username,
        email: newEmail,
        profilePicture,
      });

      await authService.updateEmail(mockedEntry);

      expect(emailVerificationService.delete).toHaveBeenCalled();
      expect(emailVerificationService.delete).toHaveBeenCalledWith({
        id: mockedEntry.token,
      });
    });

    it("should throw an error if the user doesn't exist", async () => {
      usersService.findById.mockResolvedValue(null);

      const error = await authService.updateEmail(mockedEntry).catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error).property("message").match(/user/i);
    });

    it("should throw an error if there is no existing email verification", async () => {
      usersService.findById.mockResolvedValue({
        email: oldEmail,
        username,
        id: userId,
        profilePicture,
        authMethod: "email",
        registrationDate: new Date(),
      });

      emailVerificationService.findById.mockResolvedValue(null);

      const error = await authService.updateEmail(mockedEntry).catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error)
        .property("message")
        .match(/email verification/i)
        .match(/try again/i);
    });
  });

  describe("deleteAccount", () => {
    it("should delete the user", async () => {
      const mockedEntry = {
        userId: "1",
      };

      const mockedDeletedUser = {
        id: "1",
        username: "user",
        email: "user@email.test",
      };

      usersService.delete.mockResolvedValue(mockedDeletedUser);

      const deletedUser = await authService.deleteAccount(mockedEntry);

      expect(deletedUser).toBeDefined();
      expect(deletedUser).toEqual(mockedDeletedUser);
    });
  });

  describe("redirectToGoogle", () => {
    it("should return a url containing expected parameters", () => {
      const mockedEntry = {
        state: "http://localhost:4308",
        callback: `vscode://${PUBLISHER.toLowerCase()}.${EXTENSION_ID}/auth-callback?state=randombytes`,
      };

      envService.get.mockImplementation((key: string) => {
        switch (key) {
          case "GOOGLE_CLIENT_ID":
            return "google-client-id";

          case "GOOGLE_REDIRECT_URI":
            return "google-redirect-uri";
          default:
            break;
        }
      });

      const { googleAuthUrl } = authService.redirectToGoogle(mockedEntry);

      expect(googleAuthUrl).toBeDefined();
      expect(googleAuthUrl).toContain(
        `client_id=${envService.get("GOOGLE_CLIENT_ID")}`,
      );
      expect(googleAuthUrl).toContain(
        `redirect_uri=${encodeURIComponent(envService.get("GOOGLE_REDIRECT_URI"))}`,
      );
      expect(googleAuthUrl).toContain("response_type=code");
      expect(googleAuthUrl).toContain("scope=openid email profile");
      expect(googleAuthUrl).toContain(
        `state=${encodeURIComponent(JSON.stringify(mockedEntry))}`,
      );
    });

    it("should return a url containing expected parameters when the callback is missing", () => {
      const mockedEntry = {
        state: "http://localhost:4308",
      };

      envService.get.mockImplementation((key: string) => {
        switch (key) {
          case "GOOGLE_CLIENT_ID":
            return "google-client-id";

          case "GOOGLE_REDIRECT_URI":
            return "google-redirect-uri";
          default:
            break;
        }
      });

      const { googleAuthUrl } = authService.redirectToGoogle(mockedEntry);

      expect(googleAuthUrl).toBeDefined();
      expect(googleAuthUrl).toContain(
        `client_id=${envService.get("GOOGLE_CLIENT_ID")}`,
      );
      expect(googleAuthUrl).toContain(
        `redirect_uri=${encodeURIComponent(envService.get("GOOGLE_REDIRECT_URI"))}`,
      );
      expect(googleAuthUrl).toContain("response_type=code");
      expect(googleAuthUrl).toContain("scope=openid email profile");
      expect(googleAuthUrl).toContain(
        `state=${encodeURIComponent(JSON.stringify(mockedEntry))}`,
      );
    });
  });

  describe("handleGoogleCallback", () => {
    it("should return an access token", async () => {
      const mockedEntry = {
        type: "success" as const,
        code: "some_code_sent_by_google",
      };

      const mockedGoogleUser = {
        id: "145678",
        email: "testemail@gmail.com",
        verified_email: true,
        name: "Test Email",
        given_name: "Test",
        family_name: "Email",
        picture: "picture",
      };

      const mockedToken = "token";

      loginGoogleOauthClient.getToken.mockResolvedValue({
        tokens: {
          access_token: "access_token",
        },
      });

      global.fetch = vi
        .fn()
        .mockResolvedValue({ ok: true, json: () => mockedGoogleUser });

      usersService.findByGoogleEmail.mockResolvedValue(null);
      usersService.createGoogleUser.mockResolvedValue({
        id: "1",
        email: mockedGoogleUser.email,
        username: mockedGoogleUser.name,
      });

      jwtService.signAsync.mockResolvedValue(mockedToken);

      const returnValue = await authService.handleGoogleCallback(mockedEntry);

      expect(returnValue).toBeDefined();
      expect("accessToken" in returnValue).toBe(true);

      if ("accessToken" in returnValue) {
        expect(returnValue.accessToken).toEqual(mockedToken);
      }
    });

    it("should return the email of the user", async () => {
      const mockedEntry = {
        type: "success" as const,
        code: "some_code_sent_by_google",
      };

      const mockedGoogleUser = {
        id: "145678",
        email: "testemail@gmail.com",
        verified_email: true,
        name: "Test Email",
        given_name: "Test",
        family_name: "Email",
        picture: "picture",
      };

      const mockedToken = "token";

      loginGoogleOauthClient.getToken.mockResolvedValue({
        tokens: {
          access_token: "access_token",
        },
      });

      global.fetch = vi
        .fn()
        .mockResolvedValue({ ok: true, json: () => mockedGoogleUser });

      usersService.findByGoogleEmail.mockResolvedValue(null);
      usersService.createGoogleUser.mockResolvedValue({
        id: "1",
        email: mockedGoogleUser.email,
        username: mockedGoogleUser.name,
      });

      jwtService.signAsync.mockResolvedValue(mockedToken);

      const returnValue = await authService.handleGoogleCallback(mockedEntry);

      expect(returnValue).toBeDefined();
      expect("email" in returnValue).toBe(true);

      if ("email" in returnValue) {
        expect(returnValue.email).toEqual(mockedGoogleUser.email);
      }
    });

    it("should update the user information with the google credentials fetched if the user already exists", async () => {
      const mockedEntry = {
        type: "success" as const,
        code: "some_code_sent_by_google",
      };

      const mockedGoogleUser = {
        id: "145678",
        email: "testemail@gmail.com",
        verified_email: true,
        name: "Test Email",
        given_name: "Test",
        family_name: "Email",
        picture: "picture",
      };

      const mockedToken = "token";

      loginGoogleOauthClient.getToken.mockResolvedValue({
        tokens: {
          access_token: "access_token",
        },
      });

      global.fetch = vi
        .fn()
        .mockResolvedValue({ ok: true, json: () => mockedGoogleUser });

      usersService.findByGoogleEmail.mockResolvedValue({
        googleEmail: mockedGoogleUser.email,
        username: mockedGoogleUser.given_name,
        id: "1",
      });
      usersService.update.mockResolvedValue({
        email: mockedGoogleUser.email,
      });

      jwtService.signAsync.mockResolvedValue(mockedToken);

      await authService.handleGoogleCallback(mockedEntry);

      expect(usersService.update).toHaveBeenCalled();
      expect(usersService.update).toHaveBeenCalledWith(
        expect.objectContaining({
          googleId: mockedGoogleUser.id,
          googleEmail: mockedGoogleUser.email,
        }),
      );
    });

    it("should create the user if he doesn't already exists", async () => {
      const mockedEntry = {
        type: "success" as const,
        code: "some_code_sent_by_google",
      };

      const mockedGoogleUser = {
        id: "145678",
        email: "testemail@gmail.com",
        verified_email: true,
        name: "Test Email",
        given_name: "Test",
        family_name: "Email",
        picture: "picture",
      };

      const mockedToken = "token";

      loginGoogleOauthClient.getToken.mockResolvedValue({
        tokens: {
          access_token: "access_token",
        },
      });

      global.fetch = vi
        .fn()
        .mockResolvedValue({ ok: true, json: () => mockedGoogleUser });

      usersService.findByGoogleEmail.mockResolvedValue(null);
      usersService.createGoogleUser.mockResolvedValue({
        id: "1",
        email: mockedGoogleUser.email,
        username: mockedGoogleUser.name,
      });

      jwtService.signAsync.mockResolvedValue(mockedToken);

      await authService.handleGoogleCallback(mockedEntry);

      expect(usersService.createGoogleUser).toHaveBeenCalled();
      expect(usersService.createGoogleUser).toHaveBeenCalledWith({
        email: mockedGoogleUser.email,
        googleId: mockedGoogleUser.id,
        profilePicture: mockedGoogleUser.picture,
        googleEmail: mockedGoogleUser.email,
        username: mockedGoogleUser.name,
      });
    });

    it("should return an error object if the type passed in argument is 'error'", async () => {
      const mockedEntry = {
        type: "error" as const,
        error: "Error",
      };

      const returnValue = await authService.handleGoogleCallback(mockedEntry);

      expect(returnValue).toBeDefined();
      expect("error" in returnValue).toBe(true);

      if ("error" in returnValue) {
        expect(returnValue.error).toEqual(mockedEntry.error);

        expect(returnValue.errorDescription).toMatch(/wrong/i);
        expect(returnValue.errorDescription).toMatch(/try again/i);
      }
    });

    it("should return an error object if there is no bearer token obtained from the oauth client", async () => {
      const mockedEntry = {
        type: "success" as const,
        code: "some_code_sent_by_google",
      };

      loginGoogleOauthClient.getToken.mockResolvedValue({
        tokens: {
          access_token: null,
        },
      });

      const returnValue = await authService.handleGoogleCallback(mockedEntry);

      expect(returnValue).toBeDefined();
      expect("error" in returnValue).toBe(true);

      if ("error" in returnValue) {
        expect(returnValue.error).toMatch(/access token/i);

        expect(returnValue.errorDescription).toMatch(/wrong/i);
        expect(returnValue.errorDescription).toMatch(/authentication/i);
        expect(returnValue.errorDescription).toMatch(/try again/i);
      }
    });

    it("should return an error object if the fetch request to retrieve user credentials has thrown a standard error", async () => {
      const mockedEntry = {
        type: "success" as const,
        code: "some_code_sent_by_google",
      };

      loginGoogleOauthClient.getToken.mockResolvedValue({
        tokens: {
          access_token: "access_token",
        },
      });

      const networkError = new TypeError("Network error");

      global.fetch = vi.fn().mockThrow(networkError);

      const returnValue = await authService.handleGoogleCallback(mockedEntry);

      expect(returnValue).toBeDefined();
      expect("error" in returnValue).toBe(true);

      if ("error" in returnValue) {
        expect(returnValue.error).toEqual(networkError.name);
        expect(returnValue.errorDescription).toEqual(networkError.message);
      }
    });

    it("should return an error object if the fetch request to retrieve user credentials has thrown an unknown error", async () => {
      const mockedEntry = {
        type: "success" as const,
        code: "some_code_sent_by_google",
      };

      loginGoogleOauthClient.getToken.mockResolvedValue({
        tokens: {
          access_token: "access_token",
        },
      });

      global.fetch = vi.fn().mockThrow("An unknown error occurred");

      const returnValue = await authService.handleGoogleCallback(mockedEntry);

      expect(returnValue).toBeDefined();
      expect("error" in returnValue).toBe(true);

      if ("error" in returnValue) {
        expect(returnValue.error).toMatch(/unknown/i);

        expect(returnValue.errorDescription).toMatch(/unknown/i);
        expect(returnValue.errorDescription).toMatch(/error/i);
      }
    });

    it("should return an error object if the fetch request to retrieve user credentials failed", async () => {
      const mockedEntry = {
        type: "success" as const,
        code: "some_code_sent_by_google",
      };

      loginGoogleOauthClient.getToken.mockResolvedValue({
        tokens: {
          access_token: "access_token",
        },
      });

      global.fetch = vi.fn().mockResolvedValue({ ok: false });

      const returnValue = await authService.handleGoogleCallback(mockedEntry);

      expect(returnValue).toBeDefined();
      expect("error" in returnValue).toBe(true);

      if ("error" in returnValue) {
        expect(returnValue.error).toMatch(/failed/i);
        expect(returnValue.error).toMatch(/user info/i);

        expect(returnValue.errorDescription).toMatch(/wrong/i);
        expect(returnValue.errorDescription).toMatch(/try again/i);
      }
    });

    it("should return an error object if the parsing of the fetch request body to get the user credentials fails because of a standard error", async () => {
      const mockedEntry = {
        type: "success" as const,
        code: "some_code_sent_by_google",
      };

      loginGoogleOauthClient.getToken.mockResolvedValue({
        tokens: {
          access_token: "access_token",
        },
      });

      const syntaxError = new SyntaxError(
        "Impossible to parse the response body as JSON",
      );

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockThrow(syntaxError),
      });

      const returnValue = await authService.handleGoogleCallback(mockedEntry);

      expect(returnValue).toBeDefined();
      expect("error" in returnValue).toBe(true);

      if ("error" in returnValue) {
        expect(returnValue.error).toEqual(syntaxError.name);
        expect(returnValue.errorDescription).toEqual(syntaxError.message);
      }
    });

    it("should return an error object if the parsing of the fetch request body to get the user credentials fails because of an unknown error", async () => {
      const mockedEntry = {
        type: "success" as const,
        code: "some_code_sent_by_google",
      };

      loginGoogleOauthClient.getToken.mockResolvedValue({
        tokens: {
          access_token: "access_token",
        },
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockThrow("Unknown Error"),
      });

      const returnValue = await authService.handleGoogleCallback(mockedEntry);

      expect(returnValue).toBeDefined();
      expect("error" in returnValue).toBe(true);

      if ("error" in returnValue) {
        expect(returnValue.error).toMatch(/unknown/i);

        expect(returnValue.errorDescription).toMatch(/unknown/i);
        expect(returnValue.errorDescription).toMatch(/error/i);
      }
    });

    it("should return an error object if the user credentials fetched don't have the expected shape", async () => {
      const mockedEntry = {
        type: "success" as const,
        code: "some_code_sent_by_google",
      };

      const mockedInvalidGoogleUser = {
        id: "145678",
        verified_email: true,
        name: "Test Email",
        given_name: "Test",
        family_name: "Email",
      };

      loginGoogleOauthClient.getToken.mockResolvedValue({
        tokens: {
          access_token: "access_token",
        },
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => mockedInvalidGoogleUser,
      });

      const returnValue = await authService.handleGoogleCallback(mockedEntry);

      expect(returnValue).toBeDefined();
      expect("error" in returnValue).toBe(true);

      if ("error" in returnValue) {
        expect(returnValue.error).toMatch(/invalid input/i);
        expect(returnValue.errorDescription).toMatch(/invalid input/i);
      }
    });

    it("should return an error object if any trpc error is thrown while updating or creating the google user", async () => {
      const mockedEntry = {
        type: "success" as const,
        code: "some_code_sent_by_google",
      };

      const mockedGoogleUser = {
        id: "145678",
        email: "testemail@gmail.com",
        verified_email: true,
        name: "Test Email",
        given_name: "Test",
        family_name: "Email",
        picture: "picture",
      };

      loginGoogleOauthClient.getToken.mockResolvedValue({
        tokens: {
          access_token: "access_token",
        },
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => mockedGoogleUser,
      });

      const trpcError = new TRPCError({
        code: "BAD_REQUEST",
        message: "Something wrong happened. Please try again",
      });

      usersService.findByGoogleEmail.mockResolvedValue(null);
      usersService.createGoogleUser.mockThrow(trpcError);

      const returnValue = await authService.handleGoogleCallback(mockedEntry);

      expect(returnValue).toBeDefined();
      expect("error" in returnValue).toBe(true);

      if ("error" in returnValue) {
        expect(returnValue.error).toEqual(trpcError.code);
        expect(returnValue.errorDescription).toEqual(trpcError.message);
      }
    });

    it("should return an error object if any standard error is thrown while updating or creating the google user", async () => {
      const mockedEntry = {
        type: "success" as const,
        code: "some_code_sent_by_google",
      };

      const mockedGoogleUser = {
        id: "145678",
        email: "testemail@gmail.com",
        verified_email: true,
        name: "Test Email",
        given_name: "Test",
        family_name: "Email",
        picture: "picture",
      };

      loginGoogleOauthClient.getToken.mockResolvedValue({
        tokens: {
          access_token: "access_token",
        },
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => mockedGoogleUser,
      });

      const standardError = new Error(
        "Something wrong happened. Please try again",
      );

      usersService.findByGoogleEmail.mockResolvedValue(null);
      usersService.createGoogleUser.mockThrow(standardError);

      const returnValue = await authService.handleGoogleCallback(mockedEntry);

      expect(returnValue).toBeDefined();
      expect("error" in returnValue).toBe(true);

      if ("error" in returnValue) {
        expect(returnValue.error).toEqual(standardError.name);
        expect(returnValue.errorDescription).toEqual(standardError.message);
      }
    });

    it("should return an error object if any unknown error is thrown while updating or creating the google user", async () => {
      const mockedEntry = {
        type: "success" as const,
        code: "some_code_sent_by_google",
      };

      const mockedGoogleUser = {
        id: "145678",
        email: "testemail@gmail.com",
        verified_email: true,
        name: "Test Email",
        given_name: "Test",
        family_name: "Email",
        picture: "picture",
      };

      loginGoogleOauthClient.getToken.mockResolvedValue({
        tokens: {
          access_token: "access_token",
        },
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => mockedGoogleUser,
      });

      usersService.findByGoogleEmail.mockResolvedValue(null);
      usersService.createGoogleUser.mockThrow("Unknown error");

      const returnValue = await authService.handleGoogleCallback(mockedEntry);

      expect(returnValue).toBeDefined();
      expect("error" in returnValue).toBe(true);

      if ("error" in returnValue) {
        expect(returnValue.error).toMatch(/unknown/i);

        expect(returnValue.errorDescription).toMatch(/unknown/i);
        expect(returnValue.errorDescription).toMatch(/error/i);
      }
    });
  });

  describe("redirectToGoogleForLinking", () => {
    it("should return a url containing expected parameters", () => {
      const mockedEntry = {
        state: "http://localhost:4308",
      };

      envService.get.mockImplementation((key: string) => {
        switch (key) {
          case "GOOGLE_CLIENT_ID":
            return "google-client-id";

          case "GOOGLE_LINKING_REDIRECT_URI":
            return "google-linking-redirect-uri";
          default:
            break;
        }
      });

      const { googleUrl } = authService.redirectToGoogleForLinking(mockedEntry);

      expect(googleUrl).toBeDefined();
      expect(googleUrl).toContain(
        `client_id=${envService.get("GOOGLE_CLIENT_ID")}`,
      );
      expect(googleUrl).toContain(
        `redirect_uri=${encodeURIComponent(envService.get("GOOGLE_LINKING_REDIRECT_URI"))}`,
      );
      expect(googleUrl).toContain("response_type=code");
      expect(googleUrl).toContain("scope=openid email profile");
      expect(googleUrl).toContain(
        `state=${encodeURIComponent(mockedEntry.state)}`,
      );
    });
  });
});
