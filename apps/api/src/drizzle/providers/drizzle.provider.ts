import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { EnvService } from "@/env/env.service";

import { DRIZZLE_ASYNC_PROVIDER } from "../constants";
import * as schema from "../schema";

export const drizzleProvider = {
  provide: DRIZZLE_ASYNC_PROVIDER,
  inject: [EnvService],
  useFactory: async (envService: EnvService) => {
    const connectionString = envService.get("DATABASE_URL");
    const pool = new Pool({
      connectionString,
    });

    return drizzle(pool, { schema });
  },
};
