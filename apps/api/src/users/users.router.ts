import { TrpcService } from "src/trpc/trpc.service";

import { Injectable } from "@nestjs/common";

import { FindByIdDto, UpdateProfileDto, UpdateUserDto } from "./users.dto";
import { UsersService } from "./users.service";
@Injectable()
export class UsersRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly usersService: UsersService
  ) {}

  procedures = {
    users: this.trpcService.trpc.router({
      updateProfile: this.trpcService
        .protectedProcedure()
        .input(UpdateProfileDto)
        .mutation(async ({ ctx, input }) =>
          this.usersService.update({ id: ctx.user.sub, ...input })
        ),

      getUserById: this.trpcService
        .protectedProcedure()
        .input(FindByIdDto)
        .query(async ({ input }) =>
          this.usersService.findOne({ id: input.id })
        ),

      updateUser: this.trpcService
        .protectedProcedure()
        .input(UpdateUserDto)
        .query(async ({ input }) => this.usersService.update(input)),
    }),
  };
}
