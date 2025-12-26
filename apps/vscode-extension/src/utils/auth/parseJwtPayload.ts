import { ZodSafeParseResult } from "zod";

import { JwtPayload, JwtPayloadSchema } from "@repo/common/types-schemas";

const parseJwtPayload = (
  token: string | undefined
):
  | ZodSafeParseResult<JwtPayload>
  | {
      success: false;
      error: unknown;
    } => {
  try {
    if (!token || typeof token !== "string" || !token.includes(".")) {
      return { success: false, error: new Error("Invalid token format") };
    }

    const base64Payload = token.split(".")[1];
    const decodedPayload = Buffer.from(base64Payload, "base64").toString(
      "utf8"
    );
    const jsonPayload = JSON.parse(decodedPayload);

    return JwtPayloadSchema.safeParse(jsonPayload);
  } catch (error) {
    return { success: false, error };
  }
};

export default parseJwtPayload;
