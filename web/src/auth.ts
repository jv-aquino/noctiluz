import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./app/(backend)/services/db";

import { customSession } from "better-auth/plugins";
import { getUserRole } from "@/backend/services/auth";
import { expo } from "@better-auth/expo";
 
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "mongodb",
    }),
    emailAndPassword: {  
        enabled: true
    },
    socialProviders: { 
        google: { 
           clientId: process.env.GOOGLE_ID as string, 
           clientSecret: process.env.GOOGLE_SECRET as string, 
        }, 
    }, 
    plugins: [
        expo(),
        customSession(async ({ user, session }) => {
            const role = await getUserRole(session.userId);
            return {
                role,
                user,
                session
            };
        }),
        nextCookies(),
    ],
    trustedOrigins: [
        "noctiluz://",
        "noctiluz://*",
    ]
});