export default function Home() {
  return (
    <main className="container relative mx-auto p-4 md:p-16 gap-4 flex flex-col max-w-2xl lowercase">
      <section>
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-1.5">
            <h1 className="text-2xl font-bold">Clip Studio</h1>
            <p className="max-w-md text-pretty text-sm text-muted-foreground">
              Create viral social media content using AI
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
