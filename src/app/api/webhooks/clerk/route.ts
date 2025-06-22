import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Missing secret", { status: 500 });
  }
  const wh = new Webhook(secret);

  const body = await req.text();
  const headers = req.headers;

  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": headers.get("svix-id") ?? "",
      "svix-timestamp": headers.get("svix-timestamp") ?? "",
      "svix-signature": headers.get("svix-signature") ?? "",
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = event.data;

    // Validate required data
    if (!id) {
      console.error("Missing user ID in webhook event");
      return new Response("Invalid event data", { status: 400 });
    }

    try {
      await prisma.user.upsert({
        where: { clerkId: id },
        update: {},
        create: {
          clerkId: id,
          email: email_addresses?.[0]?.email_address ?? "",
          name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
          cpf: "", // Default or extract if available
          phone: "", // Default or extract if available
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Database operation failed:", error);
      return new Response("Database error", { status: 500 });
    }
  }
  return NextResponse.json({ success: true });
}
