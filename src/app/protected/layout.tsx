import { Header } from '@/components/header';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center pt-20">
        <div className="flex w-full flex-1 flex-col items-center gap-20">
          <div className="flex max-w-5xl flex-1 flex-col gap-20 p-5">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
