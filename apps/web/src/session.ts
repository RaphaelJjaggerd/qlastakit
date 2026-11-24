// The session behind an interface. 2.4a replaces the stub with Better Auth's session
// (httpOnly cookie, read through the server-side before-load check).
export type Role = "owner" | "admin" | "member";

export interface Session {
  user: { name: string; email: string };
  authority: Role[];
}

export interface SessionSource {
  get(): Promise<Session | null>;
  /** The placeholder sign-in route calls this; 2.4a replaces it with the real form. */
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

const stubUser: Session = {
  user: { name: "Stub User", email: "stub@example.com" },
  authority: ["owner"],
};

/**
 * Stub until 2.4a. Signed in by default so the notes page and the smoke test keep working.
 * It is module state, which is fine for a stub and wrong for a real session.
 */
export function createStubSession(initial: Session | null = stubUser): SessionSource {
  let current = initial;
  return {
    get: async () => current,
    signIn: async () => {
      current = initial ?? stubUser;
    },
    signOut: async () => {
      current = null;
    },
  };
}
