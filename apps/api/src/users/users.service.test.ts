import * as bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DrizzleAsyncProvider } from "@/drizzle/drizzle.provider";
import { Test } from "@nestjs/testing";
import { TRPCError } from "@trpc/server";

import { UsersService } from "./users.service";

describe("UsersService", () => {
  let usersService: UsersService;

  const mockedDrizzle = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DrizzleAsyncProvider,
          useValue: mockedDrizzle,
        },
      ],
    }).compile();

    usersService = moduleRef.get(UsersService);
  });

  describe("create", () => {
    const email = "test@email.test";
    const username = "test";

    const mockedUserData = {
      email,
      username,
      password: "password",
      emailVerifiedAt: new Date(),
    };

    const mockedCreatedUser = {
      id: "1",
      email,
      username,
    };

    it("should return the created user", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);
      mockedDrizzle.returning.mockResolvedValue([mockedCreatedUser]);

      const createdUser = await usersService.create(mockedUserData);

      expect(createdUser).toBeDefined();
      expect(createdUser).toEqual(mockedCreatedUser);
    });

    it("should hash the user password", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);
      mockedDrizzle.returning.mockResolvedValue([mockedCreatedUser]);
      const spyHash = vi.spyOn(bcrypt, "hash");

      await usersService.create(mockedUserData);

      expect(spyHash).toHaveBeenCalled();
      expect(spyHash).toHaveBeenCalledWith(
        mockedUserData.password,
        expect.anything(),
      );
    });

    it("should throw an error when the email is already used", async () => {
      mockedDrizzle.limit.mockResolvedValue([
        { email, username: "otherUsername" },
      ]);

      const error = await usersService.create(mockedUserData).catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("CONFLICT");
      expect(error).property("message").match(/email/);
    });

    it("should throw an error when the username is already used", async () => {
      mockedDrizzle.limit.mockResolvedValue([
        { username, email: "otherEmail" },
      ]);

      const error = await usersService.create(mockedUserData).catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("CONFLICT");
      expect(error)
        .property("message")
        .match(/username/);
    });
  });

  describe("createGoogleUser", () => {
    const email = "test@gmail.com";
    const username = "test";

    const mockedUserData = {
      email,
      googleEmail: email,
      username,
      googleId: "id",
      profilePicture: "picture",
    };

    const mockedCreatedUser = {
      id: "1",
      email,
      username,
    };

    it("should return the new google user", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);
      mockedDrizzle.returning.mockResolvedValue([mockedCreatedUser]);

      const createdUser = await usersService.createGoogleUser(mockedUserData);

      expect(createdUser).toBeDefined();
      expect(createdUser).toEqual(mockedCreatedUser);
    });

    it("should use 'google' as authMethod", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);
      mockedDrizzle.returning.mockResolvedValue([mockedCreatedUser]);

      await usersService.createGoogleUser(mockedUserData);

      expect(mockedDrizzle.values).toHaveBeenCalled();
      expect(mockedDrizzle.values).toHaveBeenCalledOnce();
      expect(mockedDrizzle.values).toHaveBeenCalledWith({
        ...mockedDrizzle.values.mock.calls[0][0],
        authMethod: "google",
      });
    });

    it("should throw an error when the google email is already used", async () => {
      mockedDrizzle.limit.mockResolvedValue([{ googleEmail: email }]);
      const error = await usersService
        .createGoogleUser(mockedUserData)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("CONFLICT");
      expect(error)
        .property("message")
        .match(/google email/);
    });

    it("should throw an error when the email is already used", async () => {
      mockedDrizzle.limit.mockResolvedValue([{ email }]);
      const error = await usersService
        .createGoogleUser(mockedUserData)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("CONFLICT");
      expect(error).property("message").match(/email/);
    });

    it("should throw an error when the username is already used", async () => {
      mockedDrizzle.limit.mockResolvedValue([{ username }]);
      const error = await usersService
        .createGoogleUser(mockedUserData)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("CONFLICT");
      expect(error)
        .property("message")
        .match(/username/);
    });
  });

  describe("findById", () => {
    const userId = "1";

    it("should return the user found", async () => {
      const mockedFoundUser = {
        email: "test@email.test",
        username: "test",
        id: userId,
        profilePicture: "profile",
        registrationDate: new Date(),
        authMethod: "email",
      };

      mockedDrizzle.limit.mockResolvedValue([mockedFoundUser]);

      const userFound = await usersService.findById({ id: userId });

      expect(userFound).toBeDefined();
      expect(userFound).toEqual(mockedFoundUser);
    });

    it("should return the user found with google auth method", async () => {
      const mockedFoundUser = {
        email: "test@email.test",
        username: "test",
        id: userId,
        profilePicture: "profile",
        registrationDate: new Date(),
        authMethod: "google",
      };

      mockedDrizzle.limit.mockResolvedValue([mockedFoundUser]);

      const userFound = await usersService.findById({ id: userId });

      expect(userFound).toBeDefined();
      expect(userFound).toEqual(mockedFoundUser);
    });

    it("should return the user found with both auth method", async () => {
      const mockedFoundUser = {
        email: "test@email.test",
        username: "test",
        id: userId,
        profilePicture: "profile",
        registrationDate: new Date(),
        authMethod: "both",
      };

      mockedDrizzle.limit.mockResolvedValue([mockedFoundUser]);

      const userFound = await usersService.findById({ id: userId });

      expect(userFound).toBeDefined();
      expect(userFound).toEqual(mockedFoundUser);
    });

    it("should return null when the user is not found", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);

      const userFound = await usersService.findById({ id: userId });

      expect(userFound).toBeNull();
    });
  });

  describe("findByEmail", () => {
    const email = "test@email.test";

    it("should return the user found", async () => {
      const mockedFoundUser = {
        email,
        username: "test",
        id: "1",
        profilePicture: "picture",
        hashedPassword: "hashed",
      };

      mockedDrizzle.limit.mockResolvedValue([mockedFoundUser]);

      const userFound = await usersService.findByEmail({ email });

      expect(userFound).toBeDefined();
      expect(userFound).toEqual(mockedFoundUser);
    });

    it("should return null when the user is not found", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);

      const userFound = await usersService.findByEmail({ email });

      expect(userFound).toBeNull();
    });
  });

  describe("findByUsername", () => {
    const username = "test";

    it("should return the user found", async () => {
      const mockedFoundUser = {
        email: "test@email.test",
        username,
        id: "1",
      };

      mockedDrizzle.limit.mockResolvedValue([mockedFoundUser]);

      const userFound = await usersService.findByUsername({ username });

      expect(userFound).toBeDefined();
      expect(userFound).toEqual(mockedFoundUser);
    });

    it("should return null when the user is not found", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);

      const userFound = await usersService.findByUsername({ username });

      expect(userFound).toBeNull();
    });
  });

  describe("findByGoogleEmail", () => {
    const googleEmail = "test@gmail.com";

    it("should return the user found", async () => {
      const mockedFoundUser = {
        googleEmail,
        username: "test",
        id: "1",
      };

      mockedDrizzle.limit.mockResolvedValue([mockedFoundUser]);

      const userFound = await usersService.findByGoogleEmail({ googleEmail });

      expect(userFound).toBeDefined();
      expect(userFound).toEqual(mockedFoundUser);
    });

    it("should return null when the user is not found", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);

      const userFound = await usersService.findByGoogleEmail({ googleEmail });

      expect(userFound).toBeNull();
    });
  });
});
