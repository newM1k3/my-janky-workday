import type { HomebaseData } from '../types';

export const homebaseMock: HomebaseData = {
  date: 'Monday, July 1',
  shifts: [
    { name: 'Jordan K.', role: 'Game Master', time: '10:00 AM – 2:00 PM' },
    { name: 'Sam T.', role: 'Game Master', time: '12:00 PM – 6:00 PM' },
    { name: 'Riley M.', role: 'Front Desk', time: '10:00 AM – 4:00 PM' },
    { name: '— UNCOVERED —', role: 'Game Master', time: '6:00 PM – Close', gap: true },
    { name: 'Alex P.', role: 'Floor Lead', time: '2:00 PM – Close' },
  ],
};
