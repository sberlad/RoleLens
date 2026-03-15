export default function SettingsPage() {
  return (
    <div className="page-container max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">Provider configuration and security notes.</p>
      </div>

      {/* Provider Status */}
      <div className="card mb-6">
        <h2 className="mb-1 text-sm font-semibold text-neutral-900">AI Provider</h2>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white text-sm font-semibold">
            AI
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-900">OpenAI</div>
            <div className="text-xs text-neutral-500">Configured via server-side environment variable</div>
          </div>
          <div className="ml-auto">
            <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="card mb-6 border-amber-200 bg-amber-50">
        <h2 className="mb-2 text-sm font-semibold text-amber-900">Security Architecture</h2>
        <div className="space-y-2 text-sm text-amber-800">
          <p>
            Your OpenAI API key is stored <strong>server-side only</strong> in{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">.env.local</code>.
            It is never sent to the browser, never returned in API responses, and never stored in
            localStorage or any client-side storage.
          </p>
          <p>
            All AI calls (CV parsing, match scoring, tailoring, cover letter generation) happen
            exclusively in Next.js API routes on the server.
          </p>
        </div>
      </div>

      {/* Configuration */}
      <div className="card mb-6">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Configuration</h2>
        <div className="space-y-4 text-sm">
          <div>
            <div className="label mb-1">API Key Location</div>
            <code className="block rounded-lg bg-neutral-100 px-4 py-2 font-mono text-xs text-neutral-700">
              .env.local → OPENAI_API_KEY=sk-...
            </code>
          </div>
          <div>
            <div className="label mb-1">Model</div>
            <code className="block rounded-lg bg-neutral-100 px-4 py-2 font-mono text-xs text-neutral-700">
              .env.local → OPENAI_MODEL=gpt-4o-mini (default)
            </code>
            <p className="mt-1 text-xs text-neutral-400">
              Override with <code>gpt-4o</code> for higher quality outputs (costs more).
            </p>
          </div>
          <div>
            <div className="label mb-1">Data Storage</div>
            <code className="block rounded-lg bg-neutral-100 px-4 py-2 font-mono text-xs text-neutral-700">
              ./data/ (local JSON files)
            </code>
            <p className="mt-1 text-xs text-neutral-400">
              Profile, jobs, and generated outputs are stored as plain JSON files locally.
            </p>
          </div>
        </div>
      </div>

      {/* Provider Abstraction */}
      <div className="card mb-6">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Provider Architecture</h2>
        <p className="text-sm text-neutral-600">
          The app uses a provider abstraction layer in{" "}
          <code className="rounded bg-neutral-100 px-1 font-mono text-xs">lib/ai/provider.ts</code>.
          All application code calls through this interface — not directly to OpenAI. Adding a new
          provider (e.g., Anthropic Claude) requires only:
        </p>
        <ol className="mt-3 space-y-1 text-sm text-neutral-600">
          <li className="flex gap-2">
            <span className="font-medium">1.</span>
            Create{" "}
            <code className="rounded bg-neutral-100 px-1 font-mono text-xs">lib/ai/anthropic.ts</code>{" "}
            implementing the <code className="rounded bg-neutral-100 px-1 font-mono text-xs">AIProvider</code> interface
          </li>
          <li className="flex gap-2">
            <span className="font-medium">2.</span>
            Call{" "}
            <code className="rounded bg-neutral-100 px-1 font-mono text-xs">setProvider(new AnthropicProvider())</code>
          </li>
          <li className="flex gap-2">
            <span className="font-medium">3.</span>
            No other application code changes needed
          </li>
        </ol>
      </div>

      {/* Future Roadmap */}
      <div className="card border-neutral-100 bg-neutral-50">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">Planned: Provider Management UI</h2>
        <p className="text-sm text-neutral-500">
          A future version will support configuring providers through a secure UI — storing encrypted
          API keys, switching between providers, and managing usage. For now, configuration is
          intentionally server-side only for simplicity and security.
        </p>
      </div>
    </div>
  );
}
