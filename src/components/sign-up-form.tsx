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

export function SignUpForm({
  className,
  onSwitchToLogin,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  onSwitchToLogin?: () => void;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            full_name: fullName,
            student_id: studentId,
          },
        },
      });
      if (error) throw error;
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
        <h2 className="text-2xl font-semibold">Get Started</h2>
      </div>
      <form onSubmit={handleSignUp}>
        <div className="flex flex-col gap-4">
          <FormInput
            label="Full Name"
            type="text"
            placeholder="Enter Last Name, Given Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <FormInput
            label="Alumni email address"
            type="email"
            placeholder="Enter email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormInput
            label="Student ID"
            type="text"
            placeholder="Enter your UP Student ID"
            required
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <FormInput
            label="Create new password"
            type="password"
            placeholder="Enter password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="signup-accept-terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              />
              <Label
                htmlFor="signup-accept-terms"
                className="cursor-pointer text-sm font-normal"
              >
                By registering, I agree to accept the{' '}
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
                id="signup-remember-device"
                checked={rememberDevice}
                onCheckedChange={(checked) =>
                  setRememberDevice(checked === true)
                }
              />
              <Label
                htmlFor="signup-remember-device"
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
              loadingText="Creating account..."
              disabled={!acceptTerms}
            >
              Register
            </FormButton>
            {onSwitchToLogin ? (
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-sm underline-offset-4 hover:underline"
              >
                Log to existing
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm underline-offset-4 hover:underline"
              >
                Log to existing
              </Link>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
