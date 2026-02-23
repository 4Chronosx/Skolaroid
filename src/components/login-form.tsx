'use client';

import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { FormInput } from '@/components/ui/form-input';
import { FormButton } from '@/components/ui/form-button';
import { FormError } from '@/components/ui/form-error';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LoginForm({
  className,
  onSwitchToSignUp,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  onSwitchToSignUp?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push('/onboarding');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // D1: p-8 = 32px internal padding
    <div
      className={cn('flex flex-col gap-6 rounded-2xl p-6', className)}
      {...props}
    >
      {/* D2: h1 + font-bold for clear visual hierarchy */}
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        Welcome to Skolaroid
      </h1>
      <form onSubmit={handleLogin}>
        {/* D1: gap-6 = 24px between field groups */}
        <div className="flex flex-col gap-6">
          {/* D2: labelClassName font-semibold; D3: h-10 + border-gray-300 standardized */}
          <FormInput
            label="Alumni email address"
            type="email"
            placeholder="Enter email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            labelClassName="font-semibold text-gray-700"
            className="h-10 border border-gray-300"
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="Enter password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            labelClassName="font-semibold text-gray-700"
            className="h-10 border border-gray-300"
          />
          {/* D5: gap-3 between rows; py-1 on each row for mobile tap targets */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 py-1">
              <Checkbox
                id="login-accept-terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              />
              <Label
                htmlFor="login-accept-terms"
                className="cursor-pointer text-sm font-normal text-gray-600"
              >
                By logging in, I agree to accept the{' '}
                <Link
                  href="/terms"
                  className="font-medium text-skolaroid-blue underline-offset-4 hover:underline"
                >
                  Terms &amp; Service
                </Link>
              </Label>
            </div>
            <div className="flex items-center gap-2 py-1">
              <Checkbox
                id="login-remember-device"
                checked={rememberDevice}
                onCheckedChange={(checked) =>
                  setRememberDevice(checked === true)
                }
              />
              <Label
                htmlFor="login-remember-device"
                className="cursor-pointer text-sm font-normal text-gray-600"
              >
                Remember this device
              </Label>
            </div>
          </div>
          <FormError message={error} />
          {/* D4: column layout — full-width primary button, secondary link centered below */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <FormButton
              type="submit"
              isLoading={isLoading}
              loadingText="Logging in..."
              disabled={!acceptTerms}
              className="w-full"
            >
              Log In
            </FormButton>
            {onSwitchToSignUp ? (
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Create an account
              </button>
            ) : (
              <Link
                href="/auth/sign-up"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Create an account
              </Link>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
