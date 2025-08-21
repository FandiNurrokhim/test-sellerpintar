import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

interface Organization {
  id: string;
  userId: string;
  name?: string;
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
        remember: {},
      },
      async authorize(credentials) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          }
        );

        const result = await res.json();

        if (!res.ok || !result?.data?.accessToken) {
          return null;
        }

        let organizationId = null;
        let branchId = null;
        let userId = result.data.user?.id;

        try {
          let userProfile = null;

          const profileRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`,
            {
              headers: {
                Authorization: `Bearer ${result.data.accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          userProfile = await profileRes.json();
          userId = userProfile?.data?.userId || userId;

          // 2. Fetch all organizations, filter by userId
          const orgsRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations`,
            {
              headers: {
                Authorization: `Bearer ${result.data.accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          const orgsData = await orgsRes.json();
          const userOrganization = orgsData?.data?.find(
            (org: Organization) => org.userId === userId
          );
          organizationId = userOrganization?.id || null;

          // 3. Fetch branches for this organization, ambil satu branchId
          if (organizationId) {
            const branchesRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/${organizationId}/branches`,
              {
                headers: {
                  Authorization: `Bearer ${result.data.accessToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const branchesData = await branchesRes.json();

            branchId = branchesData?.data?.[0]?.id || null;
          }

          // 3. Fetch branch detail jika perlu
          if (branchId) {
            const branchRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizations/branches/${branchId}`,
              {
                headers: {
                  Authorization: `Bearer ${result.data.accessToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const branchData = await branchRes.json();
            branchId = branchData?.data?.id || branchId;
          }
        } catch (e) {
          console.error("[NextAuth] Error fetching profile/org/branch:", e);
        }

        // Simpan ke user object
        return {
          id: userId,
          name: result.data.user?.name,
          email: result.data.user?.email,
          role: result.data.user?.role,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
          expiresIn: result.data.expiresIn,
          rememberMe: credentials?.remember === "true",
          organizationId,
          branchId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || "";
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.email = user.email || "";
        token.name = user.name || undefined;
        token.organizationId = user.organizationId;
        token.branchId = user.branchId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id || token.sub || "";
      session.user.accessToken = token.accessToken;
      session.user.role = token.role;
      session.user.email = token.email || "";
      session.user.name = token.name || undefined;
      session.organizationId = token.organizationId;
      session.branchId = token.branchId;

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, 
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
