import type { Context } from "@netlify/functions";

let cache: { data: unknown; ts: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!resp.ok) throw new Error(`Token refresh failed: ${await resp.text()}`);
  const data = await resp.json() as { access_token: string };
  return data.access_token;
}

export default async (_req: Request, _context: Context) => {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return Response.json(cache.data);
  }

  const clientId = Netlify.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Netlify.env.get("GOOGLE_CLIENT_SECRET");
  const refreshToken = Netlify.env.get("GOOGLE_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) {
    return Response.json({ error: "Google Calendar credentials not set" }, { status: 500 });
  }

  try {
    const accessToken = await getAccessToken(clientId, clientSecret, refreshToken);

    // Get today's events (midnight to midnight in local time, use UTC)
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    const calResp = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        new URLSearchParams({
          timeMin: startOfDay,
          timeMax: endOfDay,
          singleEvents: "true",
          orderBy: "startTime",
          maxResults: "20",
        }),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!calResp.ok) throw new Error(`Calendar fetch failed: ${await calResp.text()}`);
    const calData = await calResp.json() as {
      items: Array<{
        summary?: string;
        location?: string;
        start: { dateTime?: string; date?: string };
      }>;
    };

    const events = calData.items.map((item) => {
      let time = "All day";
      if (item.start.dateTime) {
        time = new Date(item.start.dateTime).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
      return {
        time,
        title: item.summary ?? "(No title)",
        location: item.location,
      };
    });

    const result = events;
    cache = { data: result, ts: Date.now() };
    return Response.json(result);
  } catch (err) {
    console.error("[google-calendar]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
};

export const config = { path: "/api/google-calendar" };
