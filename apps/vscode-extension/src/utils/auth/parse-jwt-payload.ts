import z from "zod";

import { formatZodError } from "@repo/common/format-zod-error";
import { JwtPayload, JwtPayloadSchema } from "@repo/common/types-schemas";

export const parseJwtPayload = (
  token: string,
):
  | { success: true; data: JwtPayload }
  | {
      success: false;
      error: unknown;
    } => {
  try {
    const parsedJwtToken = z.jwt().safeParse(token);

    if (!parsedJwtToken.success) {
      return { success: false, error: formatZodError(parsedJwtToken.error) };
    }

    const validatedJwt = parsedJwtToken.data;

    const decodedPayload = JSON.parse(
      Buffer.from(validatedJwt.split(".")[1], "base64").toString("utf8"),
    );

    const parsedPayload = JwtPayloadSchema.safeParse(decodedPayload);

    if (!parsedPayload.success) {
      return { success: false, error: formatZodError(parsedPayload.error) };
    }

    return { success: true, data: parsedPayload.data };
  } catch (error) {
    return { success: false, error };
  }
};
