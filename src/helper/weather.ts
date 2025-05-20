import { AlertFeature } from "./types.js";

export async function fetchOpenWeatherMapWeather(latitude: number, longitude: number) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenWeatherMap API is not configured. Please set the OPENWEATHER_API_KEY environment variable.");
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&lang=kr&units=metric`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("OpenWeatherMap API call error:", error);
    return null;
  }
}

// Format alert data
export function formatAlert(feature: AlertFeature): string {
  const props = feature.properties;
  return [
    `Event: ${props.event || "Unknown"}`,
    `Area: ${props.areaDesc || "Unknown"}`,
    `Severity: ${props.severity || "Unknown"}`,
    `Status: ${props.status || "Unknown"}`,
    `Headline: ${props.headline || "No headline"}`,
    "---",
  ].join("\n");
}
