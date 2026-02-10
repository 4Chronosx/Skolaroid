export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center gap-20">
        <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
          <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
            <div className="flex items-center font-semibold">Skolaroid</div>
          </div>
        </nav>

        <div className="flex flex-1 flex-col items-center justify-center">
          <h1 className="text-4xl font-bold">Welcome</h1>
        </div>

        <footer className="mx-auto flex w-full items-center justify-center border-t py-16 text-center text-xs">
          <p>Skolaroid</p>
        </footer>
      </div>
    </main>
  );
}
