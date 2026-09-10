export function celsiusToFahrenheit(c) {
  return Math.round((c * 9) / 5 + 32);
}

export function formatTemp(celsius, unit = 'celsius') {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return '--';
  if (unit === 'fahrenheit') {
    return `${celsiusToFahrenheit(celsius)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatTempNumber(celsius, unit = 'celsius') {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return 0;
  if (unit === 'fahrenheit') {
    return celsiusToFahrenheit(celsius);
  }
  return Math.round(celsius);
}

export function getAqiColor(aqi) {
  if (aqi <= 50) return { bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-600 dark:text-emerald-400', ring: '#10b981' };
  if (aqi <= 100) return { bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400', ring: '#f59e0b' };
  if (aqi <= 150) return { bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800', text: 'text-orange-600 dark:text-orange-400', ring: '#f97316' };
  return { bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800', text: 'text-red-600 dark:text-red-400', ring: '#ef4444' };
}

export function getUVBadge(uv) {
  if (uv <= 2) return { label: 'Low', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' };
  if (uv <= 5) return { label: 'Moderate', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' };
  if (uv <= 7) return { label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300' };
  if (uv <= 10) return { label: 'Very High', color: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300' };
  return { label: 'Extreme', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300' };
}
