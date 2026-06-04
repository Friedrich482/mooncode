import * as bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { EmailService } from "@/email/email.service";
import { EmailVerificationsService } from "@/email-verifications/email-verifications.service";
import { EnvService } from "@/env/env.service";
import { PasswordResetsService } from "@/password-resets/password-resets.service";
import { UsersService } from "@/users/users.service";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { TRPCError } from "@trpc/server";
import { Procedure } from "@vitest/spy";

import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let authService: AuthService;

  let usersService: {
    findByEmail: Mock<Procedure>;
    findById: Mock<Procedure>;
    findByUsername: Mock<Procedure>;
    create: Mock<Procedure>;
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
      findByEmail: vi.fn(),
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
});
