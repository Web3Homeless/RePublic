import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GitHubProvider from "next-auth/providers/github";

import { env } from "~/env";
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log(profile); // Debug to see what's inside the profile

      user.email = profile?.email;

      if (account.provider === "github") {
        // Fallback for email
        user.email = profile?.email;

        if (!user.email && profile.emails && profile.emails.length > 0) {
          // Find primary email or use the first one
          const primaryEmail =
            profile.emails.find((e) => e.primary)?.email ||
            profile.emails[0].email;
          if (primaryEmail) {
            user.email = profile?.email;
          }
        }

        if (!user.email) {
          console.error("No email obtained from GitHub.");
          return false; // Prevent sign-in if no email is obtained
        }

        // Update or create a user record with the GitHub login
        const updatedUser = await db.user.upsert({
          where: { email: user.email },
          update: { githubLogin: profile.login },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            githubLogin: profile.login,
          },
        });
        user.id = updatedUser.id; // Important for linking sessions to the user
      }
      console.log("HAPPY PATH");
      return true;
    },
    async session({ session, user }) {
      // Include GitHub login in the session object
      if (user?.id) {
        const currentUser = await db.user.findUnique({
          where: { id: user.id },
        });
        session.user.githubLogin = currentUser?.githubLogin;
        session.user.id = user.id;
      }
      return session;
    },
    // async session({ session, user }) {
    //   // Add GitHub login to the session object
    //   let githubLogin = "";
    //   if (user.id) {
    //     const currentUser = await db.user.findUnique({
    //       where: { id: user.id },
    //     });
    //     githubLogin = currentUser.githubLogin;
    //   }
    //   return {
    //     ...session,
    //     user: {
    //       ...session.user,
    //       id: user.id,
    //       githubLogin: githubLogin,
    //     },
    //   };
    // },
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          url: "https://github.com/login/oauth/authorize",
          scope: "repo admin:org read:user user:email user",
        },
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
