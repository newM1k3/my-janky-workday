import type { Context } from "@netlify/functions";

// Homebase sends schedule notification emails to mjwdesign@gmail.com.
// This function uses the Gmail API (OAuth) to find the most recent Homebase
// schedule email and parse today's shifts from it.
//
// Required env vars (same Google OAuth creds as Calendar):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN

let cache: { data: unknown; ts: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

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

function decodeBase64Url(str: string): string {
  // Gmail uses base64url encoding
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

interface ShiftEntry {
  name: string;
  role: string;
  time: string;
  gap?: boolean;
}

function parseHomebaseEmail(body: string, todayLabel: string): ShiftEntry[] {
  // Homebase schedule emails contain lines like:
  // "Jordan K. | Game Master | 10:00 AM - 2:00 PM"
  // or similar tabular text. We parse best-effort.
  const shifts: ShiftEntry[] = [];
  const lines = body.split(/\r?\n/);
  
  // Time range pattern: e.g. "10:00 AM - 2:00 PM" or "10:00AM-2:00PM"
  const timePattern = /(\d{1,2}:\d{2}\s*[AP]M)\s*[-–]\s*(\d{1,2}:\d{2}\s*[AP]M)/i;
  
  for (const line of lines) {
    const timeMatch = line.match(timePattern);
    if (!timeMatch) continue;
    
    const timeStr = `${timeMatch[1].trim()} – ${timeMatch[2].trim()}`;
    
    // Try to extract name and role from the same line
    // Remove the time portion and split remaining
    const withoutTime = line.replace(timePattern, "").trim();
    const parts = withoutTime.split(/[|,\t]+/).map((p) => p.trim()).filter(Boolean);
    
    const name = parts[0] ?? "Unknown";
    const role = parts[1] ?? "Staff";
    
    shifts.push({ name, role, time: timeStr });
  }
  
  return shifts;
}

export default async (_req: Request, _context: Context) => {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return Response.json(cache.data);
  }

  const clientId = Netlify.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Netlify.env.get("GOOGLE_CLIENT_SECRET");
  const refreshToken = Netlify.env.get("GOOGLE_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) {
    return Response.json({ error: "Google credentials not set" }, { status: 500 });
  }

  try {
    const accessToken = await getAccessToken(clientId, clientSecret, refreshToken);
    const gmailHeaders = { Authorization: `Bearer ${accessToken}` };

    // Search for recent Homebase schedule emails
    const searchResp = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?` +
        new URLSearchParams({
          q: "from:homebase subject:schedule newer_than:7d",
          maxResults: "5",
        }),
      { headers: gmailHeaders }
    );

    if (!searchResp.ok) throw new Error(`Gmail search failed: ${await searchResp.text()}`);
    const searchData = await searchResp.json() as { messages?: Array<{ id: string }> };

    const today = new Date();
    const todayLabel = today.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric",
    });

    if (!searchData.messages || searchData.messages.length === 0) {
      // No Homebase emails found — return empty state
      const result = {
        date: todayLabel,
        shifts: [],
        note: "No Homebase schedule email found in the last 7 days.",
      };
      cache = { data: result, ts: Date.now() };
      return Response.json(result);
    }

    // Get the most recent message
    const msgResp = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${searchData.messages[0].id}?format=full`,
      { headers: gmailHeaders }
    );
    if (!msgResp.ok) throw new Error(`Gmail message fetch failed: ${await msgResp.text()}`);
    const msgData = await msgResp.json() as {
      payload: {
        body?: { data?: string };
        parts?: Array<{ mimeType: string; body: { data?: string } }>;
      };
    };

    // Extract plain text body
    let bodyText = "";
    const payload = msgData.payload;
    if (payload.body?.data) {
      bodyText = decodeBase64Url(payload.body.data);
    } else if (payload.parts) {
      const textPart = payload.parts.find((p) => p.mimeType === "text/plain");
      if (textPart?.body?.data) {
        bodyText = decodeBase64Url(textPart.body.data);
      }
    }

    const shifts = parseHomebaseEmail(bodyText, todayLabel);

    const result = {
      date: todayLabel,
      shifts: shifts.length > 0 ? shifts : [
        { name: "— Check Homebase —", role: "Schedule not parsed", time: "See app", gap: true },
      ],
    };

    cache = { data: result, ts: Date.now() };
    return Response.json(result);
  } catch (err) {
    console.error("[homebase-schedule]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
};

export const config = { path: "/api/homebase-schedule" };
