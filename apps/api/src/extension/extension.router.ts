import { TrpcService } from "@/trpc/trpc.service";
import { Injectable } from "@nestjs/common";

import {
  GetFilesForDayDto,
  GetLanguagesTimeForDayDto,
  UpsertFilesDto,
  UpsertLanguagesDto,
} from "./extension.dto";
import { ExtensionService } from "./extension.service";

@Injectable()
export class ExtensionRouter {
  constructor(
    private readonly extensionService: ExtensionService,
    private readonly trpcService: TrpcService,
  ) {}

  procedures = {
    extension: this.trpcService.trpc.router({
      getLanguagesTimeForDay: this.trpcService
        .protectedProcedure()
        .input(GetLanguagesTimeForDayDto)
        .query(async ({ ctx, input }) =>
          this.extensionService.getLanguagesTimeForDay({
            ...input,
            userId: ctx.user.sub,
          }),
        ),

      getFilesForDay: this.trpcService
        .protectedProcedure()
        .input(GetFilesForDayDto)
        .query(async ({ ctx, input }) =>
          this.extensionService.getFilesForDay({
            ...input,
            userId: ctx.user.sub,
          }),
        ),

      upsertLanguages: this.trpcService
        .protectedProcedure()
        .input(UpsertLanguagesDto)
        .mutation(async ({ ctx, input }) =>
          this.extensionService.upsertLanguages({
            ...input,
            userId: ctx.user.sub,
          }),
        ),

      upsertFiles: this.trpcService
        .protectedProcedure()
        .input(UpsertFilesDto)
        .mutation(async ({ ctx, input }) =>
          this.extensionService.upsertFiles({ ...input, userId: ctx.user.sub }),
        ),
    }),
  };
}
