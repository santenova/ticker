import { useEffect, useState } from 'react';
import { X, Loader2, ServerCog, Check, TriangleAlert } from 'lucide-react';
import { saveSettings, DEFAULT_OLLAMA_URL } from '@/lib/profile';
import { fetchModels } from '@/lib/aiBackends';

const OLLAMA_PRESETS = [
  { label: 'Local machine · localhost:11434', url: 'http://localhost:11434' },
  { label: 'Saved tunnel · ngrok', url: DEFAULT_OLLAMA_URL },
];

const EMPTY = {
  ollama_url: '',
  ollama_model: '',
  openai_base_url: '',
  openai_model: '',
  openai_key: '',
  rss2json_key: '',
};

const IDLE = { state: 'idle', message: '', models: [] };

function Field({ label, hint, ...props }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-[12.5px] tracking-tight outline-none transition-colors focus:border-foreground/30"
      />
      {hint && <span className="mt-1 block text-[11.5px] leading-snug text-muted-foreground">{hint}</span>}
    </label>
  );
}

function ModelPicker({ label, value, models, onChange, placeholder }) {
  if (!models.length) {
    return <Field label={label} placeholder={placeholder} value={value} onChange={onChange} />;
  }
  const options = models.includes(value) || !value ? models : [value, ...models];
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-[12.5px] tracking-tight outline-none transition-colors focus:border-foreground/30"
      >
        {options.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </label>
  );
}

function TestButton({ test, onTest }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
      <button
        type="button"
        onClick={onTest}
        disabled={test.state === 'loading'}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-secondary disabled:opacity-60"
      >
        {test.state === 'loading' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ServerCog className="h-3.5 w-3.5" />
        )}
        {test.state === 'loading' ? 'Testing' : 'Test connection'}
      </button>
      {test.message && (
        <span
          className={`inline-flex items-center gap-1 text-[11.5px] ${
            test.state === 'ok' ? 'text-up' : test.state === 'error' ? 'text-down' : 'text-muted-foreground'
          }`}
        >
          {test.state === 'ok' ? <Check className="h-3.5 w-3.5" /> : <TriangleAlert className="h-3.5 w-3.5" />}
          {test.message}
        </span>
      )}
    </div>
  );
}

export default function SettingsPanel({ open, settings, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ollamaTest, setOllamaTest] = useState(IDLE);
  const [openaiTest, setOpenaiTest] = useState(IDLE);

  useEffect(() => {
    if (!open) return;
    setForm({
      ollama_url: settings?.ollama_url || '',
      ollama_model: settings?.ollama_model || '',
      openai_base_url: settings?.openai_base_url || '',
      openai_model: settings?.openai_model || '',
      openai_key: '',
      rss2json_key: '',
    });
    setOllamaTest(IDLE);
    setOpenaiTest(IDLE);
    setError('');
  }, [open, settings]);

  if (!open) return null;

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const runTest = async (kind) => {
    const setTest = kind === 'ollama' ? setOllamaTest : setOpenaiTest;
    setTest({ ...IDLE, state: 'loading' });
    try {
      const result =
        kind === 'ollama'
          ? await fetchModels(form.ollama_url, form.openai_key.trim())
          : await fetchModels(form.openai_base_url, form.openai_key.trim());
      setTest({ state: 'ok', message: result.message, models: result.models });

      const modelKey = kind === 'ollama' ? 'ollama_model' : 'openai_model';
      setForm((prev) =>
        prev[modelKey] || !result.models.length ? prev : { ...prev, [modelKey]: result.models[0] }
      );
    } catch (err) {
      const hint = /Failed to fetch|NetworkError|Load failed/i.test(err.message || '')
        ? 'Could not reach it — check the URL, that the server is up, and that it allows this site (CORS).'
        : err.message;
      setTest({ state: 'error', message: hint, models: [] });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await saveSettings(form);
      onSaved(updated.settings);
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save your settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close settings"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
      />
      <div className="relative flex h-full w-full max-w-[430px] flex-col overflow-y-auto border-l border-border bg-card tp-enter">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ServerCog className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[15px] font-semibold tracking-tight">AI backends</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 px-5 py-5">
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            Summaries try Ollama first, then your OpenAI-compatible endpoint. One of the two has to be configured — everything runs from this browser.
          </p>

          <div className="space-y-3">
            <h3 className="text-[13px] font-semibold tracking-tight">Ollama</h3>
            <label className="block">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Quick select
              </span>
              <select
                value={OLLAMA_PRESETS.some((preset) => preset.url === form.ollama_url) ? form.ollama_url : ''}
                onChange={(event) =>
                  event.target.value &&
                  setForm((prev) => ({ ...prev, ollama_url: event.target.value }))
                }
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[12.5px] tracking-tight outline-none transition-colors focus:border-foreground/30"
              >
                <option value="">Choose a known endpoint…</option>
                {OLLAMA_PRESETS.map((preset) => (
                  <option key={preset.url} value={preset.url}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Base URL"
              placeholder="https://christy-ramentaceous-verbatim.ngrok-free.dev"
              value={form.ollama_url}
              onChange={update('ollama_url')}
              hint="Reachable from this browser, with this site's origin allowed (set OLLAMA_ORIGINS)."
            />
            <ModelPicker
              label="Model"
              placeholder="llama3.1"
              value={form.ollama_model}
              models={ollamaTest.models}
              onChange={update('ollama_model')}
            />
            <TestButton test={ollamaTest} onTest={() => runTest('ollama')} />
          </div>

          <div className="space-y-3 border-t border-border pt-5">
            <h3 className="text-[13px] font-semibold tracking-tight">OpenAI-compatible endpoint</h3>
            <Field
              label="Base URL"
              placeholder="https://api.openai.com/v1"
              value={form.openai_base_url}
              onChange={update('openai_base_url')}
            />
            <Field
              label="Token / API key"
              type="password"
              autoComplete="off"
              placeholder={settings?.has_openai_key ? `${settings.openai_key_hint} saved` : 'sk-...'}
              value={form.openai_key}
              onChange={update('openai_key')}
              hint="Stored only in this browser. Leave blank to keep the saved key."
            />
            <ModelPicker
              label="Model"
              placeholder="gpt-4o-mini"
              value={form.openai_model}
              models={openaiTest.models}
              onChange={update('openai_model')}
            />
            <TestButton test={openaiTest} onTest={() => runTest('openai')} />
          </div>

          <div className="space-y-3 border-t border-border pt-5">
            <h3 className="text-[13px] font-semibold tracking-tight">News feed</h3>
            <Field
              label="rss2json API key"
              type="password"
              autoComplete="off"
              placeholder={settings?.has_rss2json_key ? `${settings.rss2json_key_hint} saved` : 'optional'}
              value={form.rss2json_key}
              onChange={update('rss2json_key')}
              hint="Headlines come from api.rss2json.com. A free key from rss2json.com raises the request limit. Leave blank for anonymous access."
            />
          </div>

          {error && <p className="text-[12.5px] text-down">{error}</p>}
        </div>

        <div className="border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-[13.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving' : 'Save backends'}
          </button>
        </div>
      </div>
    </div>
  );
}