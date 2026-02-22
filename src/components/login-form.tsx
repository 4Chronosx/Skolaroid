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
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">Welcome to Skolaroid</h2>
      </div>
      <form onSubmit={handleLogin}>
        <div className="flex flex-col gap-4">
          <FormInput
            label="Alumni email address"
            type="email"
            placeholder="Enter email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="Enter password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="login-accept-terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              />
              <Label
                htmlFor="login-accept-terms"
                className="cursor-pointer text-sm font-normal"
              >
                By logging in, I agree to accept the{' '}
                <Link
                  href="/terms"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Terms &amp; Service
                </Link>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="login-remember-device"
                checked={rememberDevice}
                onCheckedChange={(checked) =>
                  setRememberDevice(checked === true)
                }
              />
              <Label
                htmlFor="login-remember-device"
                className="cursor-pointer text-sm font-normal"
              >
                Remember this device
              </Label>
            </div>
          </div>
          <FormError message={error} />
          <div className="flex items-center gap-4">
            <FormButton
              type="submit"
              isLoading={isLoading}
              loadingText="Logging in..."
              disabled={!acceptTerms}
            >
              Log In
            </FormButton>
            {onSwitchToSignUp ? (
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-sm underline-offset-4 hover:underline"
              >
                Create an account
              </button>
            ) : (
              <Link
                href="/auth/sign-up"
                className="text-sm underline-offset-4 hover:underline"
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
