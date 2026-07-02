import type { Context } from "@netlify/functions";

const PB_URL = "https://mjwdesign-core.pockethost.io";

// Simple in-memory cache (survives warm Lambda invocations)
let cache: { data: unknown; ts: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getPBToken(): Promise<string> {
  const email = Netlify.env.get("PB_ADMIN_EMAIL")!;
  const password = Netlify.env.get("PB_ADMIN_PASSWORD")!;
  const resp = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: email, password }),
  });
  if (!resp.ok) throw new Error(`PB auth failed: ${await resp.text()}`);
  const data = await resp.json() as { token: string };
  return data.token;
}

export default async (_req: Request, _context: Context) => {
  // Serve from cache if fresh
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return Response.json(cache.data);
  }

  try {
    const token = await getPBToken();
    const headers = { Authorization: `Bearer ${token}` };

    // ---- Low Stock: inventory items where quantity <= reorder_threshold ----
    // Expand product relation to get name and threshold
    const invResp = await fetch(
      `${PB_URL}/api/collections/es_inventory/records?expand=product&perPage=200`,
      { headers }
    );
    if (!invResp.ok) throw new Error(`Inventory fetch failed: ${await invResp.text()}`);
    const invData = await invResp.json() as { items: Array<{
      quantity: number;
      expand?: { product?: { name: string; reorder_threshold: number } };
    }> };

    const lowStock = invData.items
      .filter((r) => {
        const threshold = r.expand?.product?.reorder_threshold ?? 0;
        return threshold > 0 && r.quantity <= threshold;
      })
      .map((r) => ({
        item: r.expand?.product?.name ?? "Unknown",
        qty: r.quantity ?? 0,
        threshold: r.expand?.product?.reorder_threshold ?? 0,
      }))
      .sort((a, b) => (a.qty / a.threshold) - (b.qty / b.threshold))
      .slice(0, 6);

    // ---- Top Consumed: adjustments with negative delta in last 7 days ----
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const adjResp = await fetch(
      `${PB_URL}/api/collections/es_adjustments/records?expand=product&perPage=500&filter=${encodeURIComponent(`created>="${sevenDaysAgo}" && delta<0`)}`,
      { headers }
    );
    if (!adjResp.ok) throw new Error(`Adjustments fetch failed: ${await adjResp.text()}`);
    const adjData = await adjResp.json() as { items: Array<{
      delta: number;
      expand?: { product?: { name: string } };
    }> };

    // Aggregate by product name
    const consumed: Record<string, number> = {};
    for (const adj of adjData.items) {
      const name = adj.expand?.product?.name ?? "Unknown";
      consumed[name] = (consumed[name] ?? 0) + Math.abs(adj.delta ?? 0);
    }
    const topConsumed = Object.entries(consumed)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([item, usedThisWeek]) => ({ item, usedThisWeek }));

    const result = { lowStock, topConsumed };
    cache = { data: result, ts: Date.now() };
    return Response.json(result);
  } catch (err) {
    console.error("[escape-stock]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
};

export const config = { path: "/api/escape-stock" };
