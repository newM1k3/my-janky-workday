import type { GitHubData } from '../types';

export const githubMock: GitHubData = {
  openPRs: 4,
  staleBranches: 7,
  commits: [
    { repo: 'immersivekit-core', message: 'Fix booking slot overlap bug', time: '2h ago' },
    { repo: 'admin-dashboard', message: 'Add role-based nav guards', time: '5h ago' },
    { repo: 'waiver-portal', message: 'Upgrade to React 18 concurrent mode', time: '1d ago' },
    { repo: 'immersivekit-core', message: 'Refactor payment webhook handler', time: '1d ago' },
    { repo: 'public-site', message: 'Update hero section copy', time: '2d ago' },
  ],
};
