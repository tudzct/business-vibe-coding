import { useEffect, useRef, useState } from 'react';
import { getSessionState, SessionApiError, startLiveStream, stopLiveStream, type SessionStateData } from '../api/session';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function streamLabel(state: SessionStateData | null): string {
  if (state?.stream?.status === 'ENDED') return 'Stream ended';
  if (state?.stream?.status === 'LIVE') return 'Live now';
  if (state?.stream?.status === 'STARTING') return 'Starting live stream';
  return 'Ready to go live';
}

interface BroadcasterLivePreviewProps {
  readonly sessionId?: string;
  readonly accessToken?: string;
}

export function BroadcasterLivePreview({ sessionId: propSessionId, accessToken: propAccessToken }: BroadcasterLivePreviewProps = {}) {
  const [state, setState] = useState<SessionStateData | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isStopConfirmationOpen, setIsStopConfirmationOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const startIdempotencyKey = useRef<string | null>(null);
  const stopIdempotencyKey = useRef<string | null>(null);
  const sessionId = propSessionId || (new URLSearchParams(window.location.search).get('sessionId') ?? window.sessionStorage.getItem('activeSessionId') ?? '');
  const accessToken = propAccessToken || (window.sessionStorage.getItem('sessionAccessToken') ?? '');

  useEffect(() => {
    if (!uuidPattern.test(sessionId) || !accessToken) return;
    const controller = new AbortController();
    void getSessionState(sessionId, accessToken)
      .then((nextState) => { if (!controller.signal.aborted) setState(nextState); })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setMessage(error instanceof SessionApiError ? error.message : 'The broadcaster session could not be loaded.');
      });
    return () => controller.abort();
  }, [accessToken, sessionId]);

  const refreshAfterVersionConflict = async (): Promise<void> => {
    try { setState(await getSessionState(sessionId, accessToken)); } catch { /* Preserve the original safe error. */ }
  };

  const start = async (): Promise<void> => {
    if (!uuidPattern.test(sessionId)) { setMessage('A valid session is required to start a live stream.'); return; }
    if (!accessToken) { setMessage('An authenticated access context is required to start a live stream.'); return; }
    const expectedVersion = state?.stream?.version;
    if (typeof expectedVersion !== 'number' || !Number.isInteger(expectedVersion)) { setMessage('The current stream version is unavailable. Refresh the session and try again.'); return; }
    setMessage(null);
    setIsStarting(true);
    startIdempotencyKey.current ??= crypto.randomUUID();
    try {
      const command = await startLiveStream(sessionId, accessToken, startIdempotencyKey.current, expectedVersion);
      setState((current) => current ? { ...current, stream: command.stream, session: command.session } : current);
      setState(await getSessionState(sessionId, accessToken));
      startIdempotencyKey.current = null;
    } catch (error: unknown) {
      setMessage(error instanceof SessionApiError ? error.message : 'A technical failure prevented the live stream from starting.');
      if (error instanceof SessionApiError && error.message.toLowerCase().includes('version')) await refreshAfterVersionConflict();
    } finally { setIsStarting(false); }
  };

  const stop = async (): Promise<void> => {
    if (!uuidPattern.test(sessionId)) { setMessage('A valid session is required to end a live stream.'); return; }
    if (!accessToken) { setMessage('An authenticated access context is required to end a live stream.'); return; }
    const expectedVersion = state?.stream?.version;
    if (typeof expectedVersion !== 'number' || !Number.isInteger(expectedVersion)) { setMessage('The current stream version is unavailable. Refresh the session and try again.'); return; }
    if (state?.stream?.status !== 'LIVE' && state?.stream?.status !== 'STARTING') { setMessage('The live stream cannot be ended in its current state.'); return; }
    setMessage(null);
    setIsStopping(true);
    stopIdempotencyKey.current ??= crypto.randomUUID();
    try {
      const command = await stopLiveStream(sessionId, accessToken, stopIdempotencyKey.current, expectedVersion);
      setState((current) => current ? { ...current, stream: command.stream, session: command.session } : current);
      setState(await getSessionState(sessionId, accessToken));
      setIsStopConfirmationOpen(false);
      stopIdempotencyKey.current = null;
    } catch (error: unknown) {
      setMessage(error instanceof SessionApiError ? error.message : 'A technical failure prevented the live stream from ending.');
      if (error instanceof SessionApiError && error.message.toLowerCase().includes('version')) await refreshAfterVersionConflict();
    } finally { setIsStopping(false); }
  };

  const isLive = state?.stream?.status === 'LIVE';
  const isReady = state?.stream?.status === 'READY';
  const canStop = state?.stream?.status === 'LIVE' || state?.stream?.status === 'STARTING';

  return (
    <main className="min-h-screen bg-black p-4 font-sans text-[#eff0fa] md:p-6" data-node-id="6007:87452">
      <header className="flex items-center justify-between gap-4 pb-6" data-node-id="6007:87453">
        <div className="flex h-8 w-8 items-center justify-center text-2xl text-[#538dff]" aria-label="Video conferencing">*</div>
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-lg bg-[#2e3038] px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#538dff]">Record</button>
          <button type="button" onClick={() => void start()} disabled={!isReady || isStarting || isLive || isStopping} className="rounded-lg bg-[#2572ed] px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#84aaff] disabled:cursor-not-allowed disabled:opacity-60">{isStarting ? 'Starting...' : isLive ? 'Live' : 'Go Live'}</button>
        </div>
      </header>
      <section className="relative flex min-h-[min(72vh,790px)] items-center justify-center overflow-hidden rounded-2xl bg-[#11131a]" aria-label="Broadcaster video preview" data-node-id="6007:87456">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#c8f7ff_0%,#72a6a3_25%,#26333a_60%,#11131a_100%)] opacity-80" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#7e47eb] text-[34px] font-semibold" aria-label="Rita B broadcaster">RB</div>
        <span className="absolute bottom-3 left-3 rounded-lg bg-black/65 px-2 py-1 text-sm">Rita B</span>
        <button type="button" onClick={() => setIsMenuOpen((open) => !open)} aria-expanded={isMenuOpen} aria-controls="broadcaster-menu" className="absolute bottom-3 right-3 rounded-lg bg-black/65 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#538dff]" aria-label="Open broadcaster session menu">Menu</button>
        {isMenuOpen && <div id="broadcaster-menu" role="menu" className="absolute bottom-14 right-3 w-52 rounded-lg border border-[#272a31] bg-[#191b23] p-2 shadow-xl"><button type="button" role="menuitem" onClick={() => setMessage('Broadcaster settings are available for this session.')} className="w-full rounded px-3 py-2 text-left text-sm hover:bg-[#2e3038] focus:bg-[#2e3038] focus:outline-none">Broadcaster settings</button><button type="button" role="menuitem" onClick={() => setMessage('Invite controls are available while broadcasting.')} className="w-full rounded px-3 py-2 text-left text-sm hover:bg-[#2e3038] focus:bg-[#2e3038] focus:outline-none">Invite participants</button></div>}
      </section>
      <section className="mt-4 flex flex-col gap-4 border-t border-[#272a31] pt-4 md:flex-row md:items-center md:justify-between" data-node-id="6007:87454">
        <div className="flex gap-3"><button type="button" className="rounded-lg bg-[#2e3038] px-4 py-3" aria-label="Toggle microphone">Mic</button><button type="button" className="rounded-lg border border-[#272a31] px-4 py-3" aria-label="Toggle camera">Camera</button></div>
        <p className="text-sm font-semibold text-[#c5c6d0]" role="status" aria-live="polite">{streamLabel(state)}</p>
        <div className="flex flex-wrap gap-3"><button type="button" className="rounded-lg border border-[#272a31] px-4 py-3" aria-label="Open chat">Chat</button><button type="button" className="rounded-lg border border-[#272a31] px-4 py-3" aria-label="View participants">Participants 5</button><button type="button" className="rounded-lg border border-[#272a31] px-4 py-3" aria-label="More session controls">More</button>{canStop && <button type="button" onClick={() => { setMessage(null); setIsStopConfirmationOpen(true); }} disabled={isStopping} className="rounded-lg bg-[#c74e5b] px-4 py-3 text-sm font-semibold text-[#ffedec] focus:outline-none focus:ring-2 focus:ring-[#ffb4ab] disabled:cursor-not-allowed disabled:opacity-60">End</button>}</div>
      </section>
      {isStopConfirmationOpen && <section className="mt-4 ml-auto flex w-full max-w-[308px] flex-col gap-4 rounded-2xl bg-[#11131a] p-4" aria-label="End live stream confirmation" data-node-id="6007:87451">
        <p className="text-sm leading-5 tracking-[0.25px] text-[#c5c6d0]">Are you sure you want to end the stream? You can&apos;t undo this action.</p>
        <div className="flex gap-4"><button type="button" onClick={() => setIsStopConfirmationOpen(false)} disabled={isStopping} className="h-12 flex-1 rounded-lg border border-[#444954] px-4 text-base font-semibold tracking-[0.5px] text-[#eff0fa] focus:outline-none focus:ring-2 focus:ring-[#84aaff] disabled:cursor-not-allowed disabled:opacity-60">Cancel</button><button type="button" onClick={() => void stop()} disabled={isStopping} className="h-12 flex-1 rounded-lg border border-[#c74e5b] bg-[#c74e5b] px-4 text-base font-semibold tracking-[0.5px] text-[#ffedec] focus:outline-none focus:ring-2 focus:ring-[#ffb4ab] disabled:cursor-not-allowed disabled:opacity-60">{isStopping ? 'Ending...' : 'End'}</button></div>
      </section>}
      {message && <p className="mt-4 rounded-lg border border-red-400/50 bg-red-400/10 p-3 text-sm text-red-100" role="alert">{message}</p>}
      {!state && !message && <p className="mt-4 text-sm text-[#c5c6d0]" role="status">Loading broadcaster session...</p>}
    </main>
  );
}
