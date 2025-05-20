import { server } from "../server.js";
import { z } from "zod";
import { fetchOpenWeatherMapWeather } from "../helper/weather.js";

interface OpenWeatherMapAlert {
  sender_name?: string;
  event?: string;
  start?: number;
  end?: number;
  description?: string;
}

// Register weather tools
server.tool(
  "get-alerts",
  "Get weather alerts for a location (OpenWeatherMap)",
  {
    latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
    longitude: z.number().min(-180).max(180).describe("Longitude of the location"),
  },
  async({ latitude, longitude }) => {
    const weatherData = await fetchOpenWeatherMapWeather(latitude, longitude);
    if (!weatherData) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve weather data for coordinates: ${latitude}, ${longitude}.`,
          },
        ],
      };
    }
    // OpenWeatherMap One Call API alerts field
    const alerts: OpenWeatherMapAlert[] = weatherData.alerts;
    if (!alerts || alerts.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No active weather alerts for (${latitude}, ${longitude})`,
          },
        ],
      };
    }
    const formattedAlerts = alerts.map((alert) =>
      [
        `Event: ${alert.event || "Unknown"}`,
        `Sender: ${alert.sender_name || "Unknown"}`,
        `Start: ${alert.start ? new Date(alert.start * 1000).toLocaleString() : "Unknown"}`,
        `End: ${alert.end ? new Date(alert.end * 1000).toLocaleString() : "Unknown"}`,
        `Description: ${alert.description || "No description"}`,
        "---",
      ].join("\n"),
    );
    const alertsText = `Active weather alerts for (${latitude}, ${longitude}):\n\n${formattedAlerts.join("\n")}`;
    return {
      content: [
        {
          type: "text",
          text: alertsText,
        },
      ],
    };
  },
);

server.tool(
  "get-forecast",
  "Get weather forecast for a location (OpenWeatherMap)",
  {
    latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
    longitude: z.number().min(-180).max(180).describe("Longitude of the location"),
  },
  async({ latitude, longitude }) => {
    const weatherData = await fetchOpenWeatherMapWeather(latitude, longitude);
    if (!weatherData) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve weather data for coordinates: ${latitude}, ${longitude}.`,
          },
        ],
      };
    }

    const name = weatherData.name || "Unknown location";
    const weather = weatherData.weather?.[0]?.description || "No description";
    const temp = weatherData.main?.temp !== undefined ? `${weatherData.main.temp}°C` : "Unknown";
    const feelsLike = weatherData.main?.feels_like !== undefined ? `${weatherData.main.feels_like}°C` : "Unknown";
    const humidity = weatherData.main?.humidity !== undefined ? `${weatherData.main.humidity}%` : "Unknown";
    const wind = weatherData.wind ? `${weatherData.wind.speed} m/s, ${weatherData.wind.deg}°` : "Unknown";

    const forecastText =
      `OpenWeatherMap Forecast for ${name} (${latitude}, ${longitude}):\n\n` +
      `weather: ${weather}\n` +
      `temp: ${temp} (feels like: ${feelsLike})\n` +
      `humidity: ${humidity}\n` +
      `wind: ${wind}`;

    return {
      content: [
        {
          type: "text",
          text: forecastText,
        },
      ],
    };
  },
);
