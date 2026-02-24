import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Check Your Email</h1>

          <p className="text-gray-600">
            We&apos;ve sent you a confirmation email. Please check your inbox
            and click the verification link to complete your sign up.
          </p>

          <div className="mt-6 w-full space-y-4">
            <Link
              href="/auth/login"
              className="block w-full rounded-lg bg-skolaroid-blue px-4 py-2 text-center text-white transition-colors hover:bg-skolaroid-blue/90"
            >
              Back to Login
            </Link>

            <p className="text-sm text-gray-500">
              Didn&apos;t receive the email? Check your spam folder or try
              signing up again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
