import 'dotenv/config'

export function loadEnv() {
  return {
    port: process.env.PORT ?? '4000',
    host: process.env.HOST ?? '127.0.0.1',
    clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  }
}
