
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';
import { weatherWorkflow } from './workflows/weather-workflow';
import { createWeatherAgent } from './agents/weather-agent';
import type { Env, CloudflareContext } from './types';

export const createMastra = (context: CloudflareContext) => {
  const { env } = context;
  const weatherAgent = createWeatherAgent(env);

  return new Mastra({
    workflows: { weatherWorkflow },
    agents: { weatherAgent },
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
    logger: new PinoLogger({
      name: 'Mastra',
      level: env.ENVIRONMENT === 'production' ? 'info' : 'debug',
    }),
    deployer: new CloudflareDeployer({
      buildCommand: 'npm run build',
      buildOutput: 'dist',
    }),
  });
};
