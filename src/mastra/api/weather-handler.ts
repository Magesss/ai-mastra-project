import { CloudflareContext } from '../types';
import { createWeatherAgent } from '../agents/weather-agent';

// 定义请求体的类型
interface WeatherRequest {
  location?: string;
  query?: string;
}

// 处理 CORS 请求的响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 创建 CORS 响应
const createCorsResponse = (response: Response): Response => {
  const newResponse = new Response(response.body, response);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  return newResponse;
};

export const handleWeatherRequest = async (request: Request, context: CloudflareContext) => {
  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    if (request.method !== 'POST') {
      return createCorsResponse(
        new Response('Method not allowed', { status: 405 })
      );
    }

    const body = (await request.json()) as WeatherRequest;
    
    if (!body.location && !body.query) {
      return createCorsResponse(
        new Response('Location or query is required', { status: 400 })
      );
    }

    const weatherAgent = createWeatherAgent(context.env);
    
    // 如果提供了 location，直接获取天气信息
    if (body.location) {
      const result = await weatherAgent.invoke([{
        role: 'user',
        content: `What's the weather like in ${body.location}?`
      }]);

      return createCorsResponse(
        new Response(JSON.stringify({
          response: result.content,
          weatherData: result.context
        }), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    }

    // 如果提供了 query，处理自然语言查询
    if (body.query) {
      const result = await weatherAgent.invoke([{
        role: 'user',
        content: body.query
      }]);

      return createCorsResponse(
        new Response(JSON.stringify({
          response: result.content,
          weatherData: result.context
        }), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    }

  } catch (error) {
    console.error('Error handling weather request:', error);
    return createCorsResponse(
      new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  }
};
