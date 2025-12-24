import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

// Replace with Redis/Vercel KV/DB. This is just illustrative.
const inMemory = new Map<string, string>();

export async function POST(req: Request) {
  const state = await req.json(); // your scenario object
  const id = nanoid(8); // short, URL-safe

  // Store serialized state (optionally encrypted) with TTL in real storage.
  inMemory.set(id, JSON.stringify(state));

  return NextResponse.json({ id });
}
