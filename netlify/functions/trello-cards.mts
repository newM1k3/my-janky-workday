import type { Context } from "@netlify/functions";

// General Ops board — the only board we query for the dashboard card
const GENERAL_OPS_BOARD_ID = "QWrvwJas";

// List IDs to include: Mike, ANYONE TO DO, INCOMING ISSUES
const TARGET_LIST_IDS = new Set([
  "676483172b9df08efc4d3180", // Mike
  "68a8d0d8c5fa3c2b0732d4b8", // ANYONE TO DO
  "69d7a61df2718b7a33c6d4aa", // INCOMING ISSUES
]);

const LIST_PRIORITY: Record<string, number> = {
  "INCOMING ISSUES": 0,
  "ANYONE TO DO": 1,
  "Mike": 2,
};

const MAX_CARDS = 10;

let cache: { data: unknown; ts: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export default async (_req: Request, _context: Context) => {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return Response.json(cache.data);
  }

  const key = Netlify.env.get("TRELLO_API_KEY");
  const token = Netlify.env.get("TRELLO_TOKEN");
  if (!key || !token) {
    return Response.json({ error: "Trello credentials not set" }, { status: 500 });
  }

  try {
    // Fetch all open cards from the General Ops board
    const cardsResp = await fetch(
      `https://api.trello.com/1/boards/${GENERAL_OPS_BOARD_ID}/cards?key=${key}&token=${token}&fields=name,due,idList,closed,shortUrl&filter=open`
    );
    if (!cardsResp.ok) {
      return Response.json({ error: "Failed to fetch Trello cards" }, { status: 502 });
    }
    const cards = await cardsResp.json() as Array<{
      name: string;
      due: string | null;
      idList: string;
      closed: boolean;
      shortUrl: string;
    }>;

    // List name lookup
    const LIST_NAMES: Record<string, string> = {
      "676483172b9df08efc4d3180": "Mike",
      "68a8d0d8c5fa3c2b0732d4b8": "ANYONE TO DO",
      "69d7a61df2718b7a33c6d4aa": "INCOMING ISSUES",
    };

    // Filter to target lists only, exclude closed cards
    const filtered = cards
      .filter((c) => !c.closed && TARGET_LIST_IDS.has(c.idList))
      .map((c) => {
        const listName = LIST_NAMES[c.idList] ?? "Unknown";
        return {
          name: c.name,
          due: c.due
            ? new Date(c.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : null,
          list: listName,
          url: c.shortUrl,
          _priority: LIST_PRIORITY[listName] ?? 99,
          _dueMs: c.due ? new Date(c.due).getTime() : Infinity,
        };
      });

    // Sort: INCOMING ISSUES first, then ANYONE TO DO, then Mike; within each list by due date (nulls last)
    filtered.sort((a, b) => {
      if (a._priority !== b._priority) return a._priority - b._priority;
      return a._dueMs - b._dueMs;
    });

    const result = {
      board: "General Ops",
      lists: ["INCOMING ISSUES", "ANYONE TO DO", "Mike"],
      cards: filtered.slice(0, MAX_CARDS).map(({ _priority, _dueMs, ...c }) => c),
    };

    cache = { data: result, ts: Date.now() };
    return Response.json(result);
  } catch (err) {
    console.error("[trello-cards]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
};

export const config = { path: "/api/trello-cards" };
