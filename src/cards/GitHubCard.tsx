import React, { useState, useEffect } from 'react';
import { Github, GitPullRequest, GitBranch, GitCommit, AlertTriangle } from 'lucide-react';
import CardShell from '../components/CardShell';
import ExpandedOverlay from '../components/ExpandedOverlay';
import { githubMock } from '../mockData/github';
import type { GitHubData } from '../types';

export default function GitHubCard() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<GitHubData>(githubMock);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/github-activity')
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((d: GitHubData) => { setData(d); setError(false); })
      .catch(() => { setError(true); setData(githubMock); })
      .finally(() => setLoading(false));
  }, []);

  const d = data;

  return (
    <>
      <CardShell
        title="GitHub Activity"
        icon={<Github size={16} />}
        status={error ? 'attention' : d.openPRs > 0 ? 'attention' : 'live'}
        statusLabel={error ? 'Offline' : loading ? 'Loading…' : `${d.openPRs} open PRs`}
        preview={error ? "Couldn't load GitHub" : loading ? 'Fetching activity…' : `${d.openPRs} open PRs · ${d.staleBranches} stale branches · ${d.commits[0]?.message ?? ''}`}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ExpandedOverlay
          title="GitHub Activity"
          icon={<Github size={18} />}
          status={error ? 'attention' : d.openPRs > 0 ? 'attention' : 'live'}
          statusLabel={error ? 'Offline' : `${d.openPRs} open PRs`}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-3">
                <AlertTriangle size={14} className="text-amber-400" />
                <span className="font-mono text-xs text-amber-300">Couldn't reach GitHub — showing cached data.</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 bg-zinc-800 rounded-lg px-4 py-3">
                <GitPullRequest size={16} className="text-amber-400" />
                <div>
                  <div className="font-heading text-xl font-bold text-zinc-100">{d.openPRs}</div>
                  <div className="font-mono text-xs text-zinc-500">Open PRs</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-zinc-800 rounded-lg px-4 py-3">
                <GitBranch size={16} className="text-zinc-400" />
                <div>
                  <div className="font-heading text-xl font-bold text-zinc-100">{d.staleBranches}</div>
                  <div className="font-mono text-xs text-zinc-500">Stale Branches</div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase tracking-widest mb-2">
                <GitCommit size={12} />
                Recent Commits
              </div>
              <div className="space-y-2">
                {d.commits.map((commit, i) => (
                  <div key={i} className="bg-zinc-800 rounded-lg px-4 py-3">
                    <div className="font-body text-sm text-zinc-200 mb-1">{commit.message}</div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-zinc-500">{commit.repo}</span>
                      <span className="font-mono text-xs text-zinc-600">{commit.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ExpandedOverlay>
      )}
    </>
  );
}
