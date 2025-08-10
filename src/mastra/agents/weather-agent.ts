import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { weatherTool } from '../tools/weather-tool';
import type { Env } from '../types';

export const createWeatherAgent = (env: Env) => {
  return new Agent({
    name: 'Weather Agent',
    instructions: `
      You are a helpful weather assistant that provides accurate weather information and can help planning activities based on the weather.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn't in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative
      - If the user asks for activities and provides the weather forecast, suggest activities based on the weather forecast.
      - If the user asks for activities, respond in the format they request.

      Use the weatherTool to fetch current weather data.
`,
    model: openai('gpt-4-turbo-preview', {
      apiKey: env.OPENAI_API_KEY,
    }),
    tools: { weatherTool },
    memory: new Memory({
      storage: {
        async get(key: string) {
          return await env.WEATHER_KV.get(key);
        },
        async set(key: string, value: string) {
          await env.WEATHER_KV.put(key, value);
        },
        async delete(key: string) {
          await env.WEATHER_KV.delete(key);
        },
      },
    }),
  });
};
