import React, { useState } from 'react';
import { Github, GitPullRequest, GitBranch, GitCommit } from 'lucide-react';
import CardShell from '../components/CardShell';
import ExpandedOverlay from '../components/ExpandedOverlay';
import { githubMock } from '../mockData/github';

export default function GitHubCard() {
  const [open, setOpen] = useState(false);
  const d = githubMock;

  return (
    <>
      <CardShell
        title="GitHub Activity"
        icon={<Github size={16} />}
        status={d.openPRs > 0 ? 'attention' : 'live'}
        statusLabel={`${d.openPRs} open PRs`}
        preview={`${d.openPRs} open PRs · ${d.staleBranches} stale branches · ${d.commits[0].message}`}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ExpandedOverlay
          title="GitHub Activity"
          icon={<Github size={18} />}
          status={d.openPRs > 0 ? 'attention' : 'live'}
          statusLabel={`${d.openPRs} open PRs`}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-5">
            {/* Stats */}
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

            {/* Recent commits */}
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
