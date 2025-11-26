import { TrpcService } from "src/trpc/trpc.service";

import { Injectable } from "@nestjs/common";
import { createPendingRegistrationDto } from "@repo/common/types-schemas";

import { PendingRegistrationsService } from "./pending-registrations.service";

@Injectable()
export class PendingRegistrationsRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly pendingRegistrationsService: PendingRegistrationsService
  ) {}

  procedures = {
    pendingRegistrations: this.trpcService.trpc.router({
      create: this.trpcService
        .publicProcedure()
        .input(createPendingRegistrationDto)
        .mutation(async ({ input }) =>
          this.pendingRegistrationsService.create(input)
        ),
    }),
  };
}
