import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "@/server/db";
import bcrypt from 'bcryptjs'

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
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const user = await db.user.findFirst({
          where: { email: credentials?.email },
        });

        if (!user) {
          throw new Error("Wrong credentials");
        }

        if (!credentials?.password) {
          throw new Error("Wrong credentials");
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const match = await bcrypt.compare(credentials.password, user.password);

        if (!match) {
          throw new Error("Wrong credentials");
        }

        return { ...user };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 2592000 },
  callbacks: {
    signIn: async ({ user }) => {
      if (!user) {
        return false;
      }
      return true;
    },
    jwt: async ({ token, account, user }) => {
      if (!token) {
        return {};
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id
      }
      return token
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id
        },
      }
    },
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
