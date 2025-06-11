import type { auth } from "@/auth";
import { createAuthClient } from "better-auth/react" // make sure to import from better-auth/react
import { customSessionClient } from "better-auth/client/plugins";

export const authClient =  createAuthClient({
    plugins: [customSessionClient<typeof auth>()],
})