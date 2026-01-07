/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434/api/generate',
    OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'llama3.2',
    GROK_API_KEY: process.env.GROK_API_KEY || '',
    GROK_URL: process.env.GROK_URL || 'https://api.x.ai/v1/chat/completions',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
    OPENROUTER_URL: process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions',
  },
}

module.exports = nextConfig

