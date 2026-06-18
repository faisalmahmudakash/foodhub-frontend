// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:5000",
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
      },
    }),
  ],
});
