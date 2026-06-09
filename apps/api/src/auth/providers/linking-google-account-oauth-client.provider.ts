import { OAuth2Client } from "google-auth-library";

import { EnvService } from "@/env/env.service";

import { LINKING_GOOGLE_ACCOUNT_OAUTH_CLIENT_PROVIDER } from "../constants";

export const linkingGoogleAccountOauthClientProvider = {
  provide: LINKING_GOOGLE_ACCOUNT_OAUTH_CLIENT_PROVIDER,
  useFactory: (envService: EnvService) => {
    const client = new OAuth2Client({
      clientId: envService.get("GOOGLE_CLIENT_ID"),
      clientSecret: envService.get("GOOGLE_CLIENT_SECRET"),
      redirectUri: envService.get("GOOGLE_LINKING_REDIRECT_URI"),
    });

    return client;
  },
  inject: [EnvService],
};
