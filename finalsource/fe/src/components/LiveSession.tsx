import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { readSessionState, startLiveStream, type SessionState } from '../api/liveStream';

export default function LiveSession({ sessionId, accessToken }: { sessionId: string; accessToken: string }) {
  const [state, setState] = useState<SessionState | null>(null);
  const [starting, setStarting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async (signal?: AbortSignal) => setState(await readSessionState(sessionId, accessToken, signal)), [accessToken, sessionId]);
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal).catch(() => undefined); return () => controller.abort(); }, [refresh]);

  const start = async () => {
    if (starting || !state?.stream || state.stream.status !== 'READY' || !Number.isInteger(state.stream.version)) return;
    setError(''); setStarting(true);
    try {
      await startLiveStream(sessionId, accessToken, state.stream.version, crypto.randomUUID());
      await refresh();
    } catch (cause: unknown) {
      if (axios.isAxiosError<{ message?: string }>(cause)) setError(cause.response?.data?.message ?? 'The live stream could not be started.');
      else setError('The live stream could not be started. Check your connection and try again.');
    } finally { setStarting(false); }
  };

  const streamStatus = state?.stream?.status ?? 'READY';
  return <main className="min-h-screen bg-black text-[#eff0fa]">
    <header className="flex h-24 items-center justify-between bg-black px-6"><div className="flex items-center gap-6"><span className="text-2xl text-[#538dff]">✣</span><span className="text-sm font-semibold">Broadcaster Preview</span></div><div className="flex items-center gap-2"><button type="button" className="rounded-lg bg-[#2e3038] px-4 py-3 text-base font-semibold" onClick={() => setMenuOpen((open) => !open)}>Record</button><button type="button" className="rounded-lg bg-[#2572ed] px-4 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" onClick={() => void start()} disabled={starting || streamStatus !== 'READY'}>{starting ? 'Starting…' : streamStatus === 'LIVE' ? 'Live' : 'Go Live'}</button></div></header>
    <section className="flex min-h-[calc(100vh-192px)] gap-6 px-6 py-0"><div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-[#11131a]"><div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#7e47eb] text-3xl font-semibold">KA</div><span className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-sm">{state?.selfParticipant.displayName ?? 'Rita B'}</span><span className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-sm">{streamStatus}</span></div></section>
    {error && <p role="alert" className="px-6 py-3 text-sm text-[#ff9a9a]">{error}</p>}
    <footer className="flex h-24 items-center justify-center gap-4 bg-black px-6"><button type="button" className="rounded-lg border border-[#272a31] px-4 py-3" aria-label="Toggle microphone">◉</button><button type="button" className="rounded-lg border border-[#272a31] px-4 py-3" aria-label="Toggle camera">▣</button><button type="button" className="rounded-lg border border-[#272a31] px-4 py-3" aria-label="Participants">♙ 5</button></footer>
    {menuOpen && <div className="absolute right-6 top-20 z-10 rounded-lg border border-[#272a31] bg-[#2e3038] p-2" role="menu"><button type="button" className="block rounded px-3 py-2 hover:bg-[#11131a]" role="menuitem" onClick={() => setMenuOpen(false)}>Session settings</button></div>}
  </main>;
}
