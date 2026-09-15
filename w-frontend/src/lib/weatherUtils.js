export function celsiusToFahrenheit(c) {
  return Math.round((c * 9) / 5 + 32);
}

export function isFahrenheit(unit) {
  return unit === 'fahrenheit' || unit === 'F';
}

export function formatDegree(celsius, unit = 'celsius') {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return '--';
  if (isFahrenheit(unit)) {
    return `${celsiusToFahrenheit(celsius)}°`;
  }
  return `${Math.round(celsius)}°`;
}

export function formatTemp(celsius, unit = 'celsius') {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return '--';
  if (isFahrenheit(unit)) {
    return `${celsiusToFahrenheit(celsius)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatTempNumber(celsius, unit = 'celsius') {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return 0;
  if (isFahrenheit(unit)) {
    return celsiusToFahrenheit(celsius);
  }
  return Math.round(celsius);
}

