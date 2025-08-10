export interface Env {
  // KV Namespace
  WEATHER_KV: KVNamespace;
  // 环境变量
  OPENAI_API_KEY: string;
  ENVIRONMENT: string;
}

export interface CloudflareContext {
  env: Env;
  ctx: ExecutionContext;
}
