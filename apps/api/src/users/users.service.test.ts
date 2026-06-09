import * as bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MockedDrizzle } from "@/common/tests/types";
import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { Test } from "@nestjs/testing";
import { TRPCError } from "@trpc/server";

import { UsersService } from "./users.service";

describe("UsersService", () => {
  let usersService: UsersService;

  let mockedDrizzle: MockedDrizzle;

  beforeEach(async () => {
    mockedDrizzle = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      orderBy: vi.fn(),
      innerJoin: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      as: vi.fn(),
    };

    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DRIZZLE_ASYNC_PROVIDER,
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

  describe("update", () => {
    const userId = "1";
    const email = "test@email.test";
    const username = "test";
    const profilePicture = "picture";

    it("should return the updated user", async () => {
      const mockedUserFields = {
        email,
        username,
        profilePicture,
      };

      const mockedFoundUser = {
        email,
        hashedPassword: "hash",
      };

      const mockedUpdatedUser = {
        email,
        username,
        profilePicture,
      };

      mockedDrizzle.limit.mockResolvedValue([mockedFoundUser]);
      mockedDrizzle.returning.mockResolvedValue([mockedUpdatedUser]);

      const updatedUser = await usersService.update({
        id: userId,
        ...mockedUserFields,
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser).toEqual(mockedUpdatedUser);
    });

    it("should update the user password if provided", async () => {
      const mockedUserFields = {
        email,
        username,
        password: "password",
      };

      const mockedFoundUser = {
        email,
        hashedPassword: "hash",
      };

      const mockedUpdatedUser = {
        email,
        username,
        profilePicture,
      };

      mockedDrizzle.limit.mockResolvedValue([mockedFoundUser]);
      mockedDrizzle.returning.mockResolvedValue([mockedUpdatedUser]);
      const spyHash = vi.spyOn(bcrypt, "hash");

      await usersService.update({
        id: userId,
        ...mockedUserFields,
      });

      expect(spyHash).toHaveBeenCalled();
      expect(spyHash).toHaveBeenCalledWith(
        mockedUserFields.password,
        expect.anything(),
      );
      expect(mockedDrizzle.set).toHaveBeenCalled();
      expect(mockedDrizzle.set).toHaveBeenCalledWith({
        ...mockedDrizzle.set.mock.calls[0][0],
        hashedPassword: spyHash.mock.settledResults[0].value,
      });
    });

    it("should throw an error if there is no update fields provided", async () => {
      const mockedUserFields = {};

      const error = await usersService
        .update({ id: userId, ...mockedUserFields })
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("BAD_REQUEST");
      expect(error).property("message").match(/field/);
    });

    it("should throw an error if the user is not found", async () => {
      const mockedUserFields = {
        email,
        username,
        profilePicture,
      };

      mockedDrizzle.limit.mockResolvedValue([]);

      const error = await usersService
        .update({ id: userId, ...mockedUserFields })
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error).property("message").match(/user/i);
    });
  });

  describe("delete", () => {
    const userId = "1";
    const mockedUserData = { id: userId };

    it("should return the deleted user", async () => {
      const mockedDeletedUser = {
        id: userId,
        username: "test",
        email: "test@email.test",
      };

      mockedDrizzle.returning.mockResolvedValue([mockedDeletedUser]);

      const deletedUser = await usersService.delete(mockedUserData);

      expect(deletedUser).toBeDefined();
      expect(deletedUser).toEqual(mockedDeletedUser);
    });

    it("should throw an error if the user is not defined", async () => {
      mockedDrizzle.returning.mockResolvedValue([]);

      const error = await usersService.delete(mockedUserData).catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error).property("message").match(/user/i);
    });
  });
});
