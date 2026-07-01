"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, LockKeyhole, Server } from "lucide-react";
import { SignedIn, SignedOut, useClerk, useSignIn, useUser } from "@clerk/nextjs";
import { useT } from "@/lib/i18n";

export type AuthProfile = {
  name: string;
  email: string;
  imageUrl?: string;
  mode: "clerk" | "local-demo";
  signOut?: () => void;
};

const LOCAL_DEMO_KEY = "butler.localDemoAuth";
const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const AuthProfileContext = createContext<AuthProfile>({
  name: "Student",
  email: "student@example.com",
  mode: "local-demo",
});

export function useAuthProfile() {
  return useContext(AuthProfileContext);
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [localDemo, setLocalDemo] = useState(false);

  useEffect(() => {
    if (clerkConfigured) return;
    try {
      setLocalDemo(localStorage.getItem(LOCAL_DEMO_KEY) === "1");
    } catch {
      setLocalDemo(false);
    }
  }, []);

  if (!clerkConfigured) {
    if (localDemo) {
      return (
        <AuthProfileContext.Provider
          value={{
            name: "Local demo",
            email: "local-demo@butler.dev",
            mode: "local-demo",
            signOut: () => {
              try {
                localStorage.removeItem(LOCAL_DEMO_KEY);
              } catch {
                /* silent */
              }
              setLocalDemo(false);
            },
          }}
        >
          {children}
        </AuthProfileContext.Provider>
      );
    }
    return (
      <LoginScreen
        configured={false}
        onLocalDemo={() => {
          try {
            localStorage.setItem(LOCAL_DEMO_KEY, "1");
          } catch {
            /* silent */
          }
          setLocalDemo(true);
        }}
      />
    );
  }

  return (
    <>
      <SignedIn>
        <ClerkProfileProvider>{children}</ClerkProfileProvider>
      </SignedIn>
      <SignedOut>
        <ClerkLoginScreen />
      </SignedOut>
    </>
  );
}

function ClerkProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const value = useMemo<AuthProfile>(() => {
    const email = user?.primaryEmailAddress?.emailAddress ?? "";
    return {
      name: user?.fullName ?? user?.firstName ?? email.split("@")[0] ?? "Student",
      email: email || "Signed in",
      imageUrl: user?.imageUrl,
      mode: "clerk",
      signOut: () => void signOut(),
    };
  }, [signOut, user]);

  return <AuthProfileContext.Provider value={value}>{children}</AuthProfileContext.Provider>;
}

function ClerkLoginScreen() {
  const { signIn, isLoaded } = useSignIn();
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    if (!isLoaded || !signIn) return;
    setError(null);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    }
  };

  return <LoginScreen configured onGoogle={handleGoogle} googleLoading={!isLoaded} error={error} />;
}

function LoginScreen({
  configured,
  googleLoading,
  error,
  onGoogle,
  onLocalDemo,
}: {
  configured: boolean;
  googleLoading?: boolean;
  error?: string | null;
  onGoogle?: () => void;
  onLocalDemo?: () => void;
}) {
  const { t, lang, setLang } = useT();

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#0A0A0B",
        color: "#EAF3F1",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily: "var(--font-body)",
      }}
    >
      <section
        aria-label={t("auth.title")}
        style={{
          width: "min(440px, 100%)",
          border: "1px solid #2A2C2F",
          background: "#18191B",
          borderRadius: 12,
          padding: "28px 24px",
          boxShadow: "0 18px 70px rgba(0,0,0,0.42)",
        }}
      >
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              aria-hidden="true"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                display: "inline-block",
                background: "url('/assets/logo.png') center / contain no-repeat",
                filter: "invert(1) brightness(1.2)",
              }}
            />
            <strong style={{ fontSize: 18, letterSpacing: 0, fontWeight: 700 }}>Butler</strong>
          </div>
          <div
            aria-label={t("auth.language")}
            style={{
              display: "inline-flex",
              border: "1px solid #2A2C2F",
              borderRadius: 999,
              padding: 3,
              background: "#101112",
            }}
          >
            <LangButton active={lang === "en"} label="EN" onClick={() => setLang("en")} />
            <LangButton active={lang === "zh"} label="中文" onClick={() => setLang("zh")} />
          </div>
        </header>

        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: "0 0 8px", color: "#93A5A2", fontSize: 13, fontWeight: 600 }}>{t("auth.eyebrow")}</p>
          <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.08, letterSpacing: 0, fontWeight: 750 }}>
            {t("auth.title")}
          </h1>
          <p style={{ margin: "12px 0 0", color: "#A8B8B5", lineHeight: 1.55, fontSize: 15 }}>
            {t("auth.subtitle")}
          </p>
        </div>

        <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
          <Benefit icon={<CheckCircle2 size={16} />} label={t("auth.benefit.workspace")} />
          <Benefit icon={<LockKeyhole size={16} />} label={t("auth.benefit.private")} />
          <Benefit icon={<Server size={16} />} label={t("auth.benefit.deploy")} />
        </div>

        {configured ? (
          <button
            type="button"
            onClick={onGoogle}
            disabled={googleLoading}
            style={{
              width: "100%",
              height: 48,
              borderRadius: 8,
              border: "1px solid #DADCE0",
              background: "#FFFFFF",
              color: "#202124",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontSize: 15,
              fontWeight: 650,
              cursor: googleLoading ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {googleLoading ? <Loader2 size={17} className="auth-spin" /> : <GoogleMark />}
            {t("auth.google")}
          </button>
        ) : (
          <>
            <div
              role="status"
              style={{
                border: "1px solid #3B3D40",
                background: "#101112",
                borderRadius: 8,
                padding: 12,
                color: "#B5C5C2",
                fontSize: 13,
                lineHeight: 1.5,
                marginBottom: 12,
              }}
            >
              {t("auth.configNeeded")}
            </div>
            <button
              type="button"
              onClick={onLocalDemo}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 8,
                border: "1px solid #4A86A4",
                background: "#3E7591",
                color: "#FFFFFF",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {t("auth.localDemo")}
            </button>
          </>
        )}

        {error && (
          <p role="alert" style={{ margin: "12px 0 0", color: "#FF8A80", fontSize: 13, lineHeight: 1.45 }}>
            {error}
          </p>
        )}

        <p style={{ margin: "16px 0 0", color: "#6F807C", fontSize: 12, lineHeight: 1.5 }}>
          {configured ? t("auth.clerkHint") : t("auth.configHint")}
        </p>
      </section>

      <style>{`
        @keyframes auth-spin { to { transform: rotate(360deg); } }
        .auth-spin { animation: auth-spin 0.8s linear infinite; }
      `}</style>
    </main>
  );
}

function LangButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minWidth: 42,
        height: 28,
        borderRadius: 999,
        border: "none",
        background: active ? "#EAF3F1" : "transparent",
        color: active ? "#0A0A0B" : "#A8B8B5",
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );
}

function Benefit({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#C8D6D3", fontSize: 14 }}>
      <span style={{ color: "#5FD6CE", width: 18, display: "inline-flex" }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function GoogleMark() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: 15,
        color: "#4285F4",
        background: "#fff",
      }}
    >
      G
    </span>
  );
}
