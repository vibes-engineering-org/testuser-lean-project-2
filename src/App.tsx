import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccount, useConnect, useSignMessage } from "wagmi";

import { Button } from "@/components/ui/button";

function App() {
  useEffect(() => {
    // important, never remove this sdk init
    sdk.actions.ready();
  }, []);

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 px-6 py-8 sm:px-8">
        <header className="w-full max-w-sm space-y-3 text-center">
          <h1 className="text-balance text-3xl font-semibold leading-tight xs:text-4xl">
            Vibes
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            coming soon...
          </p>
        </header>
        <section className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800">
          <ConnectMenu />
        </section>
      </div>
    </main>
  );
}

function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  if (isConnected) {
    return (
      <div className="space-y-3 text-left">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Connected account
        </span>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
          {address}
        </div>
        <SignButton />
      </div>
    );
  }

  return (
    <Button
      type="button"
      onClick={() => connectors[0] && connect({ connector: connectors[0] })}
      className="w-full"
    >
      Connect
    </Button>
  );
}

function SignButton() {
  const { signMessage, isPending, data, error } = useSignMessage();

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={() => signMessage({ message: "hello world" })}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Signing..." : "Sign message"}
      </Button>
      {data && (
        <div className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left text-sm leading-relaxed text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          <span className="inline-flex items-center rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
            Signature
          </span>
          <div className="break-words font-mono text-xs">{data}</div>
        </div>
      )}
      {error && (
        <div className="space-y-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-left text-sm leading-relaxed text-red-600 dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-200">
          <span className="inline-flex items-center rounded-full bg-red-600/10 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-red-700 dark:text-red-200">
            Error
          </span>
          <p className="break-words text-xs leading-5">{error.message}</p>
        </div>
      )}
    </div>
  );
}

export default App;
