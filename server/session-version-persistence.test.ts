import { afterEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { getDb, getUserByOpenId, upsertUser } from "./db";

const fixtureOpenIds: string[] = [];

afterEach(async () => {
  const db = await getDb();
  if (!db) return;

  for (const openId of fixtureOpenIds.splice(0)) {
    await db.delete(users).where(eq(users.openId, openId));
  }
});

describe("persistência da versão de sessão", () => {
  it("sincroniza um usuário e lê a versão padrão sem erro de coluna", async () => {
    const openId = `fixture-session-version-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    fixtureOpenIds.push(openId);

    await upsertUser({
      openId,
      name: "Fixture de versão de sessão",
      email: `${openId}@example.test`,
      loginMethod: "test",
      role: "user",
    });

    const user = await getUserByOpenId(openId);

    expect(user).toMatchObject({
      openId,
      sessionVersion: 0,
    });
  }, 15_000);
});
