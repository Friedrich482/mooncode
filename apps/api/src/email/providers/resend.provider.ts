import { Resend } from "resend";

import { EnvService } from "@/env/env.service";

import { RESEND_PROVIDER } from "../constants";

export const resendProvider = {
  provide: RESEND_PROVIDER,
  useFactory: (envService: EnvService) => {
    const resend = new Resend(envService.get("RESEND_API_KEY"));

    return resend;
  },
  inject: [EnvService],
};
