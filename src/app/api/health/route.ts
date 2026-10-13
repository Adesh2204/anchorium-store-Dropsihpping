import { checkDbHealth } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await checkDbHealth();
    return Response.json(res);
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
