import type { VercelRequest, VercelResponse } from "@vercel/node";
import { reachMode } from "@atelo/reach";

export default async function handler(_req: VercelRequest, res: VercelResponse): Promise<void> {
  res.status(200).json({ ok: true, mode: reachMode() });
}
