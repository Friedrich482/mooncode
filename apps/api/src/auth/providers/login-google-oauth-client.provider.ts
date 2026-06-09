import { OAuth2Client } from "google-auth-library";

import { EnvService } from "@/env/env.service";

import { LOGIN_GOOGLE_OAUTH_CLIENT_PROVIDER } from "../constants";

export const loginGoogleOauthClientProvider = {
  provide: LOGIN_GOOGLE_OAUTH_CLIENT_PROVIDER,
  useFactory: (envService: EnvService) => {
    const client = new OAuth2Client({
      clientId: envService.get("GOOGLE_CLIENT_ID"),
      clientSecret: envService.get("GOOGLE_CLIENT_SECRET"),
      redirectUri: envService.get("GOOGLE_REDIRECT_URI"),
    });

    return client;
  },
  inject: [EnvService],
};
