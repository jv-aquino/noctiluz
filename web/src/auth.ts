import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { PrismaClient } from "@/generated/prisma";

import { customSession } from "better-auth/plugins";
import { getUserRole } from "@/backend/services/auth";
 
const prisma = new PrismaClient();

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
    plugins: [nextCookies(),
        customSession(async ({ user, session }) => {
            const role = await getUserRole(session.userId);
            return {
                role,
                user,
                session
            };
        }),
    ]
});