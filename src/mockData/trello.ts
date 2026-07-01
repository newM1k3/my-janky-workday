import type { TrelloCard } from '../types';

export const trelloMock: { board: string; cards: TrelloCard[] } = {
  board: 'ImmersiveKit — Dev',
  cards: [
    { name: 'Finalize booking flow redesign', due: 'Jul 3', list: 'In Progress', board: 'ImmersiveKit — Dev' },
    { name: 'Add staff scheduling module', due: 'Jul 5', list: 'Backlog', board: 'ImmersiveKit — Dev' },
    { name: 'Fix payment webhook handler', due: 'Jul 2', list: 'In Progress', board: 'ImmersiveKit — Dev' },
    { name: 'Write API docs for v2', due: 'Jul 8', list: 'Todo', board: 'ImmersiveKit — Dev' },
    { name: 'Mobile nav accessibility pass', due: 'Jul 10', list: 'Todo', board: 'ImmersiveKit — Dev' },
  ],
};
