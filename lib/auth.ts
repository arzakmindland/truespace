import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/db'
import User from '@/models/User'

interface UserDocument {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

// Расширяем типы NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    }
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Attempting to authorize user with email:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing email or password');
          throw new Error('Необходимо указать email и пароль')
        }

        await dbConnect()
        console.log('Connected to database');

        // Явно запрашиваем поле пароля с помощью .select('+password')
        const user = await User.findOne({ email: credentials.email }).select('+password') as UserDocument | null
        
        if (!user) {
          console.log('User not found');
          throw new Error('Пользователь не найден')
        }
        
        console.log('User found, checking password');
        console.log('Password from DB exists:', !!user.password);

        let isPasswordValid = false;
        try {
          isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
        } catch (error) {
          console.error('Error comparing passwords:', error);
          throw new Error('Ошибка при проверке пароля');
        }
        
        console.log('Password validation result:', isPasswordValid);

        if (!isPasswordValid) {
          throw new Error('Неверный пароль')
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
} 