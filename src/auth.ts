import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./lib/db"
import bcrypt from "bcryptjs"
import { logActivity } from "./lib/audit"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await db.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) return null

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (passwordsMatch) {
          // Block inactive admins/volunteers from logging in
          if (user.status !== "ACTIVE") {
            return null
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            federationId: null, // Admins don't have this
          }
        }
        return null
      }
    }),
    CredentialsProvider({
      id: "student-login",
      name: "Student Login",
      credentials: {
        aadhaarNumber: { label: "Aadhaar Number", type: "text" },
        dob: { label: "Date of Birth", type: "date" }
      },
      async authorize(credentials) {
        if (!credentials?.aadhaarNumber || !credentials?.dob) return null

        const student = await db.student.findUnique({
          where: { aadhaarNumber: credentials.aadhaarNumber as string }
        })

        // Verify that the student exists, is not deleted, DOB matches, and status is verified (ACTIVE or ALUMNI)
        if (student && !student.deletedAt && student.dob === credentials.dob) {
          if (student.status !== "ACTIVE" && student.status !== "ALUMNI") {
            return null
          }
          return {
            id: student.id,
            name: student.fullName,
            mobileNumber: student.mobileNumber,
            role: student.role,
            federationId: student.federationId
          }
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.federationId = user.federationId
        token.mobileNumber = user.mobileNumber
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.federationId = token.federationId as string | undefined
        session.user.mobileNumber = token.mobileNumber as string | undefined
      }
      return session
    }
  },
  events: {
    async signIn(message) {
      if (message.user) {
        await logActivity({
          userId: message.user.role === 'STUDENT' ? null : message.user.id,
          action: "USER_LOGIN",
          entityType: message.user.role === 'STUDENT' ? "STUDENT" : "USER",
          entityId: message.user.id as string,
          details: `${message.user.role === 'STUDENT' ? 'Student' : 'Admin/Volunteer'} logged in: ${message.user.name}`
        })
      }
    }
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" }
})
