import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/login`,
                        {
                            email: credentials?.email,
                            password: credentials?.password,
                        }
                    );

                    console.log("response", response?.data)

                    const { token, user } = response.data;

                    if (!token) return null;

                    return {
                        id: user?._id ?? credentials?.email,
                        name: user?.name ?? null,
                        email: user?.email ?? credentials?.email,
                        role: user?.role ?? "user",
                        accessToken: token,
                    };
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        console.error("AUTH ERROR STATUS:", error.response?.status);
                        console.error("AUTH ERROR DATA:", error.response?.data);
                    } else {
                        console.error("AUTH ERROR:", error);
                    }
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role;
                token.accessToken = (user as { accessToken?: string }).accessToken;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.role = token.role as string;
            session.user.accessToken = token.accessToken as string;
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
