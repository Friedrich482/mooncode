import { TrpcService } from "@/trpc/trpc.service";
import { Injectable } from "@nestjs/common";

import { HealthService } from "./health.service";

@Injectable()
export class HealthRouter {
  constructor(
    private readonly healthService: HealthService,
    private readonly trpcService: TrpcService,
  ) {}

  procedures() {
    return {
      health: this.trpcService.trpc.router({
        ping: this.trpcService
          .publicProcedure()
          .query(() => this.healthService.ping()),
      }),
    };
  }
}
