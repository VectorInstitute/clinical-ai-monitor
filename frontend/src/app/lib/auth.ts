import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(`${publicRuntimeConfig.backendUrl}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          const tokenData = await res.json();

          if (res.ok && tokenData.access_token) {
            const userRes = await fetch(`${publicRuntimeConfig.backendUrl}/users/me`, {
              headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
              }
            });

            const userData = await userRes.json();

            if (userRes.ok && userData) {
              return {
                id: userData.id.toString(),
                username: userData.username,
                role: userData.role,
                accessToken: tokenData.access_token,
              };
            }
          }
        } catch (error) {
          console.error("Authentication error:", error);
        }

        return null;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
