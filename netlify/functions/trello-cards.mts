import type { Context } from "@netlify/functions";

// All active boards in the Escape Maze Trello organization
const BOARD_IDS = [
  "67648305b2de6bcb85d2d2a7", // General Ops
  "6790fcaaf2003a3796c48748", // Haunt Season
  "67cb50c664a7719b75125d82", // Outdoor Trails
];

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
    const allCards: Array<{ name: string; due: string; list: string; board: string }> = [];

    for (const boardId of BOARD_IDS) {
      // Get board name
      const boardResp = await fetch(
        `https://api.trello.com/1/boards/${boardId}?key=${key}&token=${token}&fields=name`
      );
      if (!boardResp.ok) continue;
      const boardData = await boardResp.json() as { name: string };

      // Get lists for this board
      const listsResp = await fetch(
        `https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}&fields=id,name`
      );
      if (!listsResp.ok) continue;
      const lists = await listsResp.json() as Array<{ id: string; name: string }>;
      const listMap: Record<string, string> = {};
      for (const l of lists) listMap[l.id] = l.name;

      // Get cards with due dates
      const cardsResp = await fetch(
        `https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}&fields=name,due,idList,closed&filter=open`
      );
      if (!cardsResp.ok) continue;
      const cards = await cardsResp.json() as Array<{
        name: string;
        due: string | null;
        idList: string;
        closed: boolean;
      }>;

      for (const card of cards) {
        if (!card.due || card.closed) continue;
        const dueDate = new Date(card.due);
        const formatted = dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        allCards.push({
          name: card.name,
          due: formatted,
          list: listMap[card.idList] ?? "Unknown",
          board: boardData.name,
        });
      }
    }

    // Sort by due date ascending
    allCards.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

    const result = { board: "Escape Maze", cards: allCards.slice(0, 10) };
    cache = { data: result, ts: Date.now() };
    return Response.json(result);
  } catch (err) {
    console.error("[trello-cards]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
};

export const config = { path: "/api/trello-cards" };
