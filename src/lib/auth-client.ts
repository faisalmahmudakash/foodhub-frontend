// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  callbackURL: process.env.CALL_BACK_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        phone: {
          type: "string",
          required: false,
          input: true,
        },
        defaultAddress: {
          type: "string",
          required: false,
          input: true,
        },
        role: {
          type: "string",
          required: false,
          input: false,
        },
      },
    }),
  ],
});
