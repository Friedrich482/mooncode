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
});
