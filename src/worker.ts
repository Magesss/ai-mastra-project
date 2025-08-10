import { createMastra } from './mastra';
import type { Env } from './mastra/types';
import { handleWeatherRequest } from './mastra/api/weather-handler';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const context = { env, ctx };

    // 处理天气 API 请求
    if (url.pathname === '/api/weather') {
      return handleWeatherRequest(request, context);
    }

    // 处理其他 Mastra 请求
    const mastra = createMastra(context);
    return await mastra.handleRequest(request);
  },
};
