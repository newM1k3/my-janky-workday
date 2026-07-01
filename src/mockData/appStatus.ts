import type { AppEntry } from '../types';

export const appStatusMock: AppEntry[] = [
  // Live
  { name: 'ImmersiveKit Core', stage: 'live' },
  { name: 'Booking Engine', stage: 'live' },
  { name: 'Waiver Portal', stage: 'live' },
  { name: 'Admin Dashboard', stage: 'live' },
  { name: 'Public Site', stage: 'live' },
  { name: 'Email Automations', stage: 'live' },
  { name: 'Payment Gateway', stage: 'live' },
  // Building
  { name: 'Staff Scheduler', stage: 'building' },
  { name: 'Inventory Tracker', stage: 'building' },
  { name: 'Analytics Board', stage: 'building' },
  { name: 'Gift Card System', stage: 'building' },
  { name: 'Mobile App (iOS)', stage: 'building' },
  // Ideas
  { name: 'Franchise Portal', stage: 'idea' },
  { name: 'AI Game Hint Engine', stage: 'idea' },
  { name: 'AR Overlay Tool', stage: 'idea' },
  { name: 'Leaderboard Widget', stage: 'idea' },
  { name: 'Merch Shop Integration', stage: 'idea' },
  { name: 'Virtual Escape Kit', stage: 'idea' },
];
