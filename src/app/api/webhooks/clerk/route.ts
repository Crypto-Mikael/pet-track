import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs"; // garante ambiente Node puro

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing Clerk webhook secret" },
      { status: 500 }
    );
  }

  const payload = await req.text(); // corpo cru
  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  let evt: WebhookEvent;

  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(payload, headers) as WebhookEvent;
  } catch (err) {
    console.error("Signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const email = email_addresses?.[0]?.email_address ?? "";
    const name = `${first_name ?? ""} ${last_name ?? ""}`.trim();

    await db
      .insert(users)
      .values({
        clerkId: id,
        email,
        name,
        cpf: "",
        phone: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [users.clerkId],
        set: {
          email,
          name,
          updatedAt: new Date(),
        },
      });
  }

  return NextResponse.json({ ok: true });
}
