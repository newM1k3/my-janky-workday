import type { Context } from "@netlify/functions";

const GH_API = "https://api.github.com";
const ORG = "newM1k3";
const STALE_DAYS = 30;

let cache: { data: unknown; ts: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default async (_req: Request, _context: Context) => {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return Response.json(cache.data);
  }

  const token = Netlify.env.get("GITHUB_TOKEN");
  if (!token) return Response.json({ error: "GITHUB_TOKEN not set" }, { status: 500 });

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    // Get all repos for the user
    const reposResp = await fetch(
      `${GH_API}/users/${ORG}/repos?per_page=100&sort=pushed&type=all`,
      { headers }
    );
    if (!reposResp.ok) throw new Error(`Repos fetch failed: ${reposResp.status} ${await reposResp.text()}`);
    const repos = await reposResp.json() as Array<{
      name: string;
      full_name: string;
      pushed_at: string;
      default_branch: string;
    }>;

    // Count stale branches across all repos (no commits in 30+ days)
    const staleThreshold = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString();
    let staleBranches = 0;
    let openPRs = 0;

    // Get open PRs across all repos (use search API for efficiency)
    const prSearchResp = await fetch(
      `${GH_API}/search/issues?q=is:pr+is:open+user:${ORG}&per_page=1`,
      { headers }
    );
    if (prSearchResp.ok) {
      const prData = await prSearchResp.json() as { total_count: number };
      openPRs = prData.total_count;
    }

    // Get recent commits across top 10 most recently pushed repos
    const recentRepos = repos.slice(0, 10);
    const commits: Array<{ repo: string; message: string; time: string }> = [];

    for (const repo of recentRepos) {
      // Count stale branches for this repo
      const branchesResp = await fetch(
        `${GH_API}/repos/${repo.full_name}/branches?per_page=100`,
        { headers }
      );
      if (branchesResp.ok) {
        const branches = await branchesResp.json() as Array<{ name: string; commit: { sha: string } }>;
        for (const branch of branches) {
          if (branch.name === repo.default_branch) continue;
          // Check last commit date on this branch
          const commitResp = await fetch(
            `${GH_API}/repos/${repo.full_name}/commits/${branch.commit.sha}`,
            { headers }
          );
          if (commitResp.ok) {
            const commitData = await commitResp.json() as { commit: { committer: { date: string } } };
            if (commitData.commit.committer.date < staleThreshold) {
              staleBranches++;
            }
          }
        }
      }

      // Get recent commits for this repo
      if (commits.length < 8) {
        const commitsResp = await fetch(
          `${GH_API}/repos/${repo.full_name}/commits?per_page=3`,
          { headers }
        );
        if (commitsResp.ok) {
          const repoCommits = await commitsResp.json() as Array<{
            commit: { message: string; committer: { date: string } };
          }>;
          for (const c of repoCommits) {
            if (commits.length >= 8) break;
            commits.push({
              repo: repo.name,
              message: c.commit.message.split("\n")[0].slice(0, 80),
              time: timeAgo(c.commit.committer.date),
            });
          }
        }
      }
    }

    // Sort commits by recency (already roughly sorted since we iterate by pushed_at)
    const result = {
      openPRs,
      staleBranches,
      commits: commits.slice(0, 6),
    };

    cache = { data: result, ts: Date.now() };
    return Response.json(result);
  } catch (err) {
    console.error("[github-activity]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
};

export const config = { path: "/api/github-activity" };
