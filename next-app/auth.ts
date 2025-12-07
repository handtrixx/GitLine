import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { authConfig } from './auth.config';

type User = {
  email: string;
  password: string;
};

async function getUser(email: string): Promise<User | undefined> {
  try {
    //const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    const user = {
      email: process.env.UI_USER || '',
      password: process.env.UI_PASSWORD || ''
    };
    //compare if user = the passed email
    if (user && user.email === email) return user;
    //return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await getUser(email);
          if (!user) return null;

          return user;
        }

        console.log('Invalid credentials');
        return null;
      },
    }) as any,
  ],
});