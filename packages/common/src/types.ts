import { JWTDto, RegisterUserDto, SignInUserDto } from "./schemas";
import { z } from "zod";

export const GroupByEnum = ["days", "weeks", "months"] as const;
export type GroupBy = (typeof GroupByEnum)[number];

export type PeriodResolution = "day" | "week" | "month" | "year";

export type JwtPayloadDtoType = z.infer<typeof JWTDto>;
export type SignInUserDtoType = z.infer<typeof SignInUserDto>;
export type RegisterUserDtoType = z.infer<typeof RegisterUserDto>;

export type TrpcAuthError = {
  error: {
    json: {
      message: string;
    };
  };
};
