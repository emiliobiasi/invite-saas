import { afterAll, describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { errorHandler } from "../../../lib/error-handler";
import { authRoutes } from "../auth.routes";

const app = new Elysia().use(errorHandler).use(authRoutes);

const TEST_USER = {
  name: "Test User",
  email: `test-${Date.now()}@inviteflow.dev`,
  password: "SecurePass123!",
};

let sessionCookie: string;

describe("Auth routes — Better Auth + Supabase", () => {
  test("POST /api/auth/sign-up/email creates a new account", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(TEST_USER),
      }),
    );

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(TEST_USER.email);
    expect(body.user.name).toBe(TEST_USER.name);

    // Store session cookie for subsequent tests
    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    sessionCookie = setCookie!.split(",").map((c) => c.split(";")[0].trim()).join("; ");
  });

  test("POST /api/auth/sign-in/email logs in with existing account", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: TEST_USER.email,
          password: TEST_USER.password,
        }),
      }),
    );

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(TEST_USER.email);

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    sessionCookie = setCookie!.split(",").map((c) => c.split(";")[0].trim()).join("; ");
  });

  test("GET /api/auth/get-session returns session with valid cookie", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/auth/get-session", {
        headers: { cookie: sessionCookie },
      }),
    );

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(TEST_USER.email);
    expect(body.session).toBeDefined();
  });

  test("GET /api/auth/get-session returns null without cookie", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/auth/get-session"),
    );

    expect(response.status).toBe(200);

    const body = await response.json();
    // Better Auth returns null body or { session: null } when unauthenticated
    expect(body === null || body.session === null).toBe(true);
  });

  test("POST /api/auth/sign-in/email rejects wrong password", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: TEST_USER.email,
          password: "WrongPassword123!",
        }),
      }),
    );

    // Better Auth returns 401 or error body for invalid credentials
    const body = await response.json();
    if (response.status === 200) {
      // Some versions return 200 with error in body
      expect(body.user).toBeUndefined();
    } else {
      expect(response.status).toBeGreaterThanOrEqual(400);
    }
  });

  // Cleanup: delete the test user from Supabase
  afterAll(async () => {
    if (!sessionCookie) return;
    // Sign out to clean up the session
    await app.handle(
      new Request("http://localhost/api/auth/sign-out", {
        method: "POST",
        headers: { cookie: sessionCookie },
      }),
    );
  });
});
