// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's role. */
      role: string
      federationId?: string | null
      mobileNumber?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    federationId?: string | null
    mobileNumber?: string | null
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: string
    federationId?: string | null
    mobileNumber?: string | null
  }
}
