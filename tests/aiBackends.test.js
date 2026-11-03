// Endpoint connection check — real requests to real endpoints, nothing mocked.
import { fetchModels } from '@/lib/aiBackends';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// Probe the local Ollama once; if it is not running, its connection test is skipped
// instead of failing the suite. Everything else runs against the live internet.
async function isUp(url) {
  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/v1/models`, {
      signal: AbortSignal.timeout(4000),
    });
    return res.status < 500;
  } catch {
    return false;
  }
}

const ollamaUp = await isUp(OLLAMA_URL);
const itOllama = ollamaUp ? it : it.skip;

describe('fetchModels — URL handling', () => {
  it('requires a base URL', async () => {
    await expect(fetchModels('')).rejects.toThrow('Enter a base URL first.');
    await expect(fetchModels('   ')).rejects.toThrow('Enter a base URL first.');
  });

  it('adds the https scheme and the /v1 root to a bare host', async () => {
    // api.openai.com answers 401 without a key — reaching that status proves the
    // request really hit https://api.openai.com/v1/models.
    await expect(fetchModels('api.openai.com')).rejects.toThrow(
      /HTTP 401 at https:\/\/api\.openai\.com\/v1\/models/
    );
  });

  it('reports a bad path as an HTTP error rather than a network failure', async () => {
    await expect(fetchModels('https://api.openai.com/v1/does-not-exist')).rejects.toThrow(
      /HTTP \d{3} at https:\/\/api\.openai\.com\/v1\/does-not-exist\/v1\/models/
    );
  });
});

describe('fetchModels — live OpenAI-compatible endpoint', () => {
  it('reaches the real endpoint and surfaces its auth error', async () => {
    const error = await fetchModels('https://api.openai.com/v1', 'sk-invalid-test-key').catch((e) => e);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toMatch(/HTTP 401/);
  });
});

describe(`fetchModels — live Ollama at ${OLLAMA_URL}`, () => {
  itOllama('lists the models the local Ollama has pulled', async () => {
    const result = await fetchModels(OLLAMA_URL);

    expect(Array.isArray(result.models)).toBe(true);
    expect(result.message).toMatch(/^Connected · /);
    if (result.models.length) {
      expect(result.models).toEqual([...result.models].sort());
    }
  });
});