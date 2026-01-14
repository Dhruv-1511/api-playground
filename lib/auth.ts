import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from './db';
import User from '@/models/User';
import Workspace from '@/models/Workspace';

export const authOptions: NextAuthOptions = {
  providers: [
    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Email/Password credentials
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user) {
          throw new Error('No user found with this email');
        }

        if (user.provider !== 'credentials') {
          throw new Error(`Please sign in with ${user.provider}`);
        }

        const isValid = await user.comparePassword(credentials.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') {
        return true;
      }

      // Handle OAuth sign-in (GitHub/Google)
      await connectDB();

      const existingUser = await User.findOne({ email: user.email });

      if (existingUser) {
        // User exists - update their info if needed
        if (existingUser.provider !== account?.provider) {
          // Update provider info if they're now signing in with a different provider
          existingUser.provider = account?.provider as 'github' | 'google';
          existingUser.providerId = account?.providerAccountId;
          existingUser.image = user.image || existingUser.image;
          await existingUser.save();
        }
        return true;
      }

      // Create new user from OAuth
      const newUser = await User.create({
        name: user.name,
        email: user.email,
        image: user.image,
        provider: account?.provider,
        providerId: account?.providerAccountId,
      });

      // Create a personal workspace for the new user
      const workspace = await Workspace.create({
        name: 'Personal Workspace',
        owner: newUser._id,
        isPersonal: true,
        members: [{
          user: newUser._id,
          role: 'owner',
          joinedAt: new Date(),
        }],
      });

      // Update user with workspace
      newUser.workspaces = [workspace._id];
      newUser.activeWorkspace = workspace._id;
      await newUser.save();

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.workspaces = dbUser.workspaces.map((w: { toString: () => string }) => w.toString());
          token.activeWorkspace = dbUser.activeWorkspace?.toString();
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.workspaces = token.workspaces as string[];
        session.user.activeWorkspace = token.activeWorkspace as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
