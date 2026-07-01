import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "#0A0A0B",
          color: "#EAF3F1",
          fontFamily: "var(--font-body)",
        }}
      >
        <section
          style={{
            width: "min(420px, 100%)",
            border: "1px solid #2A2C2F",
            background: "#18191B",
            borderRadius: 12,
            padding: 24,
            lineHeight: 1.5,
          }}
        >
          <h1 style={{ margin: "0 0 8px", fontSize: 24 }}>Google sign-in is not configured</h1>
          <p style={{ margin: 0, color: "#A8B8B5" }}>
            Add Clerk environment variables and enable Google OAuth before using this callback in
            deployment.
          </p>
        </section>
      </main>
    );
  }

  return <AuthenticateWithRedirectCallback />;
}
