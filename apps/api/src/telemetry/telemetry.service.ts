import { and, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { telemetry } from "@/drizzle/schema/telemetry";
import { Inject, Injectable } from "@nestjs/common";

import { CreateTelemetryDtoType, FindTelemetryDtoType } from "./telemetry.dto";

@Injectable()
export class TelemetryService {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase,
  ) {}
  async create(createTelemetryDto: CreateTelemetryDtoType) {
    const { userId, machineId, extensionVersion, vscodeVersion } =
      createTelemetryDto;

    const [createdTelemetry] = await this.db
      .insert(telemetry)
      .values({ extensionVersion, machineId, vscodeVersion, userId })
      .returning({
        machineId: telemetry.machineId,
        extensionVersion: telemetry.extensionVersion,
        vscodeVersion: telemetry.vscodeVersion,
      });

    return createdTelemetry;
  }

  async findOne(findTelemetryDto: FindTelemetryDtoType) {
    const { userId, machineId } = findTelemetryDto;

    const [telemetryEntry] = await this.db
      .select({
        machineId: telemetry.machineId,
        extensionVersion: telemetry.extensionVersion,
        vscodeVersion: telemetry.vscodeVersion,
      })
      .from(telemetry)
      .where(
        and(eq(telemetry.userId, userId), eq(telemetry.machineId, machineId)),
      )
      .limit(1);

    if (!telemetryEntry) {
      return null;
    }

    return telemetryEntry;
  }
}
