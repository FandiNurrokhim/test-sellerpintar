import { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    organizationId?: string;
    branchId?: string;
    user: {
      id: string;
      email: string;
      name?: string | null;
      role?: string;
      accessToken?: string;
      image?: string | null;
    };
    rememberMe?: boolean;
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    name?: string | null;
    accessToken?: string;
    role?: string;
    organizationId?: string;
    branchId?: string;
    image?: string | null;
    remember?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    role?: string;
    organizationId?: string;
    branchId?: string;
    email?: string;
    name?: string;
    rememberMe?: boolean;
  }
}
