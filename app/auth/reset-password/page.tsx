import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>
      <p className="mb-6 text-center text-gray-600">
        Enter your email address below, and we'll send you a link to reset your password.
      </p>
      <ResetPasswordForm />
    </div>
  )
}

