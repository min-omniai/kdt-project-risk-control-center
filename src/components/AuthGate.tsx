import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authorizationError, setAuthorizationError] = useState("");
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;

    async function verifyAdmin(nextSession: Session | null) {
      setSession(nextSession);
      setIsAdmin(false);
      setAuthorizationError("");

      if (!nextSession || !supabase) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", nextSession.user.id)
        .maybeSingle();

      if (error) {
        setAuthorizationError("관리자 권한 테이블을 확인할 수 없습니다. Supabase 설정을 점검해 주세요.");
      } else if (!data) {
        setAuthorizationError("이 계정에는 관리자 접근 권한이 없습니다.");
      } else {
        setIsAdmin(true);
      }

      setIsLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => verifyAdmin(data.session));

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setTimeout(() => verifyAdmin(nextSession), 0);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) return <SupabaseSetupRequired />;
  if (isLoading) return <AuthLoading />;
  if (!session) return <LoginScreen />;
  if (!isAdmin) return <AccessDenied message={authorizationError} />;

  return (
    <>
      <div className="admin-session">
        <span><i /> 관리자 로그인</span>
        <strong>{session.user.email}</strong>
        <button onClick={() => supabase?.auth.signOut()} type="button">로그아웃</button>
      </div>
      {children}
    </>
  );
}

function AccessDenied({ message }: { message: string }) {
  return (
    <main className="auth-page">
      <section className="auth-card setup-card">
        <div className="auth-brand">ADMIN ACCESS REQUIRED</div>
        <h1>접근 권한이 없습니다</h1>
        <p>{message || "관리자 권한을 확인할 수 없습니다."}</p>
        <button className="secondary-auth-button" onClick={() => supabase?.auth.signOut()} type="button">
          다른 계정으로 로그인
        </button>
      </section>
    </main>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setError("");
    setIsSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsSubmitting(false);

    if (signInError) {
      setError("이메일 또는 비밀번호를 확인해 주세요.");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><span className="live-dot" /> PROJECT CONTROL CENTER</div>
        <div className="auth-lock" aria-hidden="true">◆</div>
        <h1>관리자 로그인</h1>
        <p>프로젝트 현황과 운영 데이터를 확인하려면 관리자 계정으로 로그인하세요.</p>
        <form onSubmit={handleSubmit}>
          <label>
            이메일
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            비밀번호
            <input
              autoComplete="current-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="8자 이상"
              required
              type="password"
              value={password}
            />
          </label>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "확인 중..." : "로그인"}
          </button>
        </form>
        <small>계정은 운영 관리자만 발급합니다. 공개 회원가입은 지원하지 않습니다.</small>
      </section>
    </main>
  );
}

function AuthLoading() {
  return (
    <main className="auth-page">
      <div className="auth-loading"><span /> 인증 상태 확인 중</div>
    </main>
  );
}

function SupabaseSetupRequired() {
  return (
    <main className="auth-page">
      <section className="auth-card setup-card">
        <div className="auth-brand">SUPABASE CONNECTION REQUIRED</div>
        <h1>인증 연결이 필요합니다</h1>
        <p>안전한 로그인을 활성화하려면 Supabase 프로젝트 연결값을 배포 환경에 설정해야 합니다.</p>
        <code>VITE_SUPABASE_URL</code>
        <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>
        <small>관리자 비밀번호는 코드나 환경 변수에 저장하지 않습니다.</small>
      </section>
    </main>
  );
}
