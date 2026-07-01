export type CardStatus = 'live' | 'attention' | 'idle';

export interface CardMeta {
  id: string;
  title: string;
  preview: string;
  status: CardStatus;
  statusLabel: string;
}

// Idea Capture
export interface Idea {
  id: string;
  text: string;
  created: string;
}

// Chat Tasks
export type AISource = 'Claude' | 'ChatGPT' | 'Manus' | 'Gemini' | 'Kimi' | 'Qwen' | 'Z' | 'Perplexity';

export interface ChatTask {
  id: string;
  task: string;
  source: AISource;
  chat_url?: string;
  done: boolean;
  created: string;
}

// Weather mock
export interface WeatherDay {
  day: string;
  high: number;
  low: number;
  condition: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  feelsLike: number;
  wind: number;
  humidity: number;
  forecast: WeatherDay[];
  nudge: string;
}

// Homebase mock
export interface ShiftEntry {
  name: string;
  role: string;
  time: string;
  gap?: boolean;
}

export interface HomebaseData {
  date: string;
  shifts: ShiftEntry[];
}

// EscapeStock mock
export interface StockItem {
  item: string;
  qty: number;
  threshold: number;
}

export interface EscapeStockData {
  lowStock: StockItem[];
  topConsumed: { item: string; usedThisWeek: number }[];
}

// Calendar mock
export interface CalendarEvent {
  time: string;
  title: string;
  location?: string;
}

// Trello mock
export interface TrelloCard {
  name: string;
  due: string;
  list: string;
  board: string;
}

// App Status mock
export type AppStage = 'live' | 'building' | 'idea';

export interface AppEntry {
  name: string;
  stage: AppStage;
}

// GitHub mock
export interface GitCommit {
  repo: string;
  message: string;
  time: string;
}

export interface GitHubData {
  openPRs: number;
  staleBranches: number;
  commits: GitCommit[];
}
