// app/app-router-ssr/page.tsx
"use server";

type Props = {
  searchParams: { error?: string };
};

export default async function SsrPage({ searchParams }: Props) {
  if (typeof searchParams.error !== "undefined") {
    throw new Error(
      "🎉 SSR Error with use-server: src/app-router/ssr/page.tsx"
    );
  }

  return (
    <div>
      <h1>App Router SSR with use-server: Success</h1>
      <p>The random number is {Math.random()}</p>
      <p>The date is {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
