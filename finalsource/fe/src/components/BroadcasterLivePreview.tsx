import { useEffect, useRef, useState } from 'react';
import {
  getSessionState,
  SessionApiError,
  startLiveStream,
  type SessionStateData,
} from '../api/session';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function streamLabel(state: SessionStateData | null): string {
  if (state?.stream?.status === 'LIVE') return 'Live now';
  if (state?.stream?.status === 'STARTING') return 'Starting live stream';
  return 'Ready to go live';
}

interface BroadcasterLivePreviewProps {
  sessionId?: string;
  accessToken?: string;
}

export function BroadcasterLivePreview({ sessionId: propSessionId, accessToken: propAccessToken }: BroadcasterLivePreviewProps = {}) {
  const [state, setState] = useState<SessionStateData | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const idempotencyKey = useRef<string | null>(null);
  const sessionId = propSessionId || (new URLSearchParams(window.location.search).get('sessionId') ?? window.sessionStorage.getItem('activeSessionId') ?? '');
  const accessToken = propAccessToken || (window.sessionStorage.getItem('sessionAccessToken') ?? '');

  useEffect(() => {
    if (!uuidPattern.test(sessionId) || !accessToken) return;
    const controller = new AbortController();
    void getSessionState(sessionId, accessToken)
      .then((nextState) => {
        if (!controller.signal.aborted) setState(nextState);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setMessage(error instanceof SessionApiError ? error.message : 'The broadcaster session could not be loaded.');
        }
      });
    return () => controller.abort();
  }, [accessToken, sessionId]);

  const start = async (): Promise<void> => {
    if (!uuidPattern.test(sessionId)) {
      setMessage('A valid session is required to start a live stream.');
      return;
    }
    if (!accessToken) {
      setMessage('An authenticated access context is required to start a live stream.');
      return;
    }
    const expectedVersion = state?.stream?.version;
    if (typeof expectedVersion !== 'number' || !Number.isInteger(expectedVersion)) {
      setMessage('The current stream version is unavailable. Refresh the session and try again.');
      return;
    }

    setMessage(null);
    setIsStarting(true);
    idempotencyKey.current ??= crypto.randomUUID();
    try {
      const command = await startLiveStream(sessionId, accessToken, idempotencyKey.current, expectedVersion);
      setState((current) => current ? { ...current, stream: command.stream, session: command.session } : current);
      const refreshed = await getSessionState(sessionId, accessToken);
      setState(refreshed);
      idempotencyKey.current = null;
    } catch (error: unknown) {
      setMessage(error instanceof SessionApiError ? error.message : 'A technical failure prevented the live stream from starting.');
      if (error instanceof SessionApiError && error.message.toLowerCase().includes('version')) {
        try {
          setState(await getSessionState(sessionId, accessToken));
        } catch {
          // The original safe error remains visible when a conflict refresh also fails.
        }
      }
    } finally {
      setIsStarting(false);
    }
  };

  const isLive = state?.stream?.status === 'LIVE';
  const isReady = state?.stream?.status === 'READY';

  return (
    <main className="min-h-screen bg-black p-4 font-sans text-[#eff0fa] md:p-6" data-node-id="6007:87452">
      <header className="flex items-center justify-between gap-4 pb-6" data-node-id="6007:87453">
        <div className="flex h-8 w-8 items-center justify-center text-2xl text-[#538dff]" aria-label="Video conferencing">✦</div>
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-lg bg-[#2e3038] px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#538dff]">◉ <span className="ml-1">Record</span></button>
          <button type="button" onClick={() => void start()} disabled={!isReady || isStarting || isLive} className="rounded-lg bg-[#2572ed] px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#84aaff] disabled:cursor-not-allowed disabled:opacity-60">
            {isStarting ? 'Starting…' : isLive ? 'Live' : '◉ Go Live'}
          </button>
        </div>
      </header>

      <section className="relative flex min-h-[min(72vh,790px)] items-center justify-center overflow-hidden rounded-2xl bg-[#11131a]" aria-label="Broadcaster video preview" data-node-id="6007:87456">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#c8f7ff_0%,#72a6a3_25%,#26333a_60%,#11131a_100%)] opacity-80" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#7e47eb] text-[34px] font-semibold" aria-label="Rita B broadcaster">RB</div>
        <span className="absolute bottom-3 left-3 rounded-lg bg-black/65 px-2 py-1 text-sm">Rita B</span>
        <button type="button" onClick={() => setIsMenuOpen((open) => !open)} aria-expanded={isMenuOpen} aria-controls="broadcaster-menu" className="absolute bottom-3 right-3 rounded-lg bg-black/65 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#538dff]" aria-label="Open broadcaster session menu">⋮</button>
        {isMenuOpen && <div id="broadcaster-menu" role="menu" className="absolute bottom-14 right-3 w-52 rounded-lg border border-[#272a31] bg-[#191b23] p-2 shadow-xl"><button type="button" role="menuitem" onClick={() => setMessage('Broadcaster settings are available for this session.')} className="w-full rounded px-3 py-2 text-left text-sm hover:bg-[#2e3038] focus:bg-[#2e3038] focus:outline-none">Broadcaster settings</button><button type="button" role="menuitem" onClick={() => setMessage('Invite controls are available while broadcasting.')} className="w-full rounded px-3 py-2 text-left text-sm hover:bg-[#2e3038] focus:bg-[#2e3038] focus:outline-none">Invite participants</button></div>}
      </section>

      <section className="mt-4 flex flex-col gap-4 border-t border-[#272a31] pt-4 md:flex-row md:items-center md:justify-between" data-node-id="6007:87454">
        <div className="flex gap-3"><button type="button" className="rounded-lg bg-[#2e3038] px-4 py-3" aria-label="Toggle microphone">⌁</button><button type="button" className="rounded-lg border border-[#272a31] px-4 py-3" aria-label="Toggle camera">▣</button></div>
        <p className="text-sm font-semibold text-[#c5c6d0]" role="status" aria-live="polite">{streamLabel(state)}</p>
        <div className="flex gap-3"><button type="button" className="rounded-lg border border-[#272a31] px-4 py-3" aria-label="Open chat">▢</button><button type="button" className="rounded-lg border border-[#272a31] px-4 py-3" aria-label="View participants">♙ 5</button><button type="button" className="rounded-lg border border-[#272a31] px-4 py-3" aria-label="More session controls">☰</button></div>
      </section>

      {message && <p className="mt-4 rounded-lg border border-red-400/50 bg-red-400/10 p-3 text-sm text-red-100" role="alert">{message}</p>}
      {!state && !message && <p className="mt-4 text-sm text-[#c5c6d0]" role="status">Loading broadcaster session…</p>}
    </main>
  );
}
