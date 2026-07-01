import type { WeatherData } from '../types';

export const weatherMock: WeatherData = {
  temp: 74,
  condition: 'Mostly Sunny',
  feelsLike: 71,
  wind: 9,
  humidity: 52,
  nudge: 'Great day for a disc golf promo — consider pushing a morning post.',
  forecast: [
    { day: 'Tue', high: 76, low: 59, condition: 'Sunny' },
    { day: 'Wed', high: 68, low: 55, condition: 'Cloudy' },
    { day: 'Thu', high: 63, low: 52, condition: 'Rain' },
    { day: 'Fri', high: 70, low: 57, condition: 'Partly Cloudy' },
    { day: 'Sat', high: 78, low: 60, condition: 'Sunny' },
  ],
};
