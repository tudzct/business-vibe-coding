import { useEffect, useMemo, useState } from 'react';
import {
  getLiveStreamView,
  getSessionState,
  SessionApiError,
  type LiveStreamViewData,
  type SessionStateData,
} from '../api/session';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface LiveStreamViewerProps {
  readonly sessionId?: string;
  readonly accessToken?: string;
}

function streamLabel(viewerView: LiveStreamViewData | null, sessionState: SessionStateData | null): string {
  const status = sessionState?.stream?.status ?? viewerView?.streamStatus;
  if (status === 'LIVE') return 'Live now';
  if (status === 'STARTING') return 'Starting live stream';
  if (status === 'ENDED') return 'Stream ended';
  if (status === 'READY') return 'Ready to go live';
  return 'Live session unavailable';
}

export function LiveStreamViewer({ sessionId: propSessionId, accessToken: propAccessToken }: LiveStreamViewerProps = {}) {
  const sessionId = propSessionId || new URLSearchParams(window.location.search).get('sessionId') || window.sessionStorage.getItem('activeSessionId') || '';
  const accessToken = propAccessToken || window.sessionStorage.getItem('sessionAccessToken') || '';
  const [viewerView, setViewerView] = useState<LiveStreamViewData | null>(null);
  const [sessionState, setSessionState] = useState<SessionStateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(0);

  const isValidContext = uuidPattern.test(sessionId) && accessToken.trim().length > 0;
  const controlsDisabled = isLoading || !viewerView || Boolean(errorMessage);
  const canPlayMedia = viewerView?.streamStatus === 'LIVE';
  const canPublishMedia = canPlayMedia && viewerView?.viewerRole === 'STAGE_PARTICIPANT';
  const playbackControlsDisabled = controlsDisabled || !canPlayMedia;
  const publishingControlsDisabled = controlsDisabled || !canPublishMedia;
  const participantLabel = useMemo(() => sessionState?.selfParticipant.displayName ?? 'Viewer', [sessionState]);

  useEffect(() => {
    const controller = new AbortController();
    if (!isValidContext) {
      setViewerView(null);
      setSessionState(null);
      setErrorMessage(!uuidPattern.test(sessionId) ? 'A valid live session is required to watch this stream.' : 'An authenticated access context is required to watch this stream.');
      setIsLoading(false);
      return () => controller.abort();
    }

    setIsLoading(true);
    setErrorMessage(null);
    void Promise.all([
      getLiveStreamView(sessionId, accessToken, controller.signal),
      getSessionState(sessionId, accessToken, controller.signal),
    ])
      .then(([nextViewerView, nextSessionState]) => {
        if (!controller.signal.aborted) {
          setViewerView(nextViewerView);
          setSessionState(nextSessionState);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setViewerView(null);
          setSessionState(null);
          setErrorMessage(error instanceof SessionApiError ? error.message : 'The live session could not be loaded. Please try again.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [accessToken, isValidContext, sessionId]);

  const currentStreamLabel = streamLabel(viewerView, sessionState);
  const streamUnavailable = Boolean(viewerView && !sessionState?.stream);

  return (
    <main className="min-h-screen bg-black font-sans text-[#eff0fa]" data-node-id="6007:87420">
      <header className="flex min-h-20 items-center justify-between gap-4 bg-black p-4 sm:p-6" data-node-id="6007:87421">
        <div className="flex h-8 w-8 items-center justify-center text-2xl font-semibold text-[#538dff]" aria-label="Video conferencing">*</div>
        <div className="rounded-lg border border-[#272a31] px-3 py-2 text-sm leading-6 tracking-[0.5px]">
          <span className="font-semibold">LIVE</span><span className="ml-2 text-[#c5c6d0]">{viewerView?.streamStatus === 'LIVE' ? 'Live' : '—'}</span>
        </div>
      </header>

      <section className="relative mx-auto flex min-h-[calc(100vh-176px)] max-w-[1512px] items-center justify-center overflow-hidden bg-[#11131a] px-4 py-8 sm:px-6" aria-label="Live stream player" data-node-id="6007:87423">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,#c8f7ff_0%,#72a6a3_24%,#26333a_60%,#11131a_100%)] opacity-75" />
        {isLoading && <p className="relative rounded-lg border border-[#272a31] bg-black/70 px-4 py-3 text-sm text-[#c5c6d0]" role="status">Loading live session…</p>}
        {errorMessage && <p className="relative max-w-md rounded-lg border border-[#c74e5b] bg-black/80 px-4 py-3 text-sm text-[#ffedec]" role="alert">{errorMessage}</p>}
        {!isLoading && !errorMessage && <>
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#538dff] text-3xl font-semibold" aria-label={`${participantLabel} stream media`}>{participantLabel.slice(0, 2).toUpperCase()}</div>
          <span className="absolute bottom-6 left-6 rounded-lg bg-black/65 px-2 py-1 text-sm">{participantLabel}</span>
          {streamUnavailable && <p className="absolute inset-x-6 bottom-20 rounded-lg border border-[#444954] bg-black/80 p-3 text-center text-sm text-[#c5c6d0]" role="status">The stream is currently unavailable.</p>}
        </>}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-black/70 px-4 pb-4 pt-10 sm:px-6" data-node-id="6007:87424">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button type="button" disabled={playbackControlsDisabled} onClick={() => setIsPaused((paused) => !paused)} className="rounded p-1 text-xl focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:cursor-not-allowed disabled:opacity-60" aria-label={isPaused ? 'Play stream' : 'Pause stream'}>{isPaused ? '▶' : 'Ⅱ'}</button>
              <label className="flex items-center gap-2 text-sm" aria-label="Stream volume"><span aria-hidden="true">◖</span><input type="range" min="0" max="100" value={volume} disabled={playbackControlsDisabled} onChange={(event) => setVolume(Number(event.target.value))} className="accent-[#eff0fa] disabled:opacity-60" /></label>
              <span className="rounded-full px-1 text-xs font-semibold tracking-[0.4px]">● LIVE</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#c5c6d0]">
              <button type="button" disabled={controlsDisabled} className="rounded p-1 focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:opacity-60" aria-label="Video quality">⚙ Auto • 720p</button>
              <button type="button" disabled={controlsDisabled} className="rounded p-1 text-lg focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:opacity-60" aria-label="Fullscreen">⛶</button>
            </div>
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-4 bg-black p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6" data-node-id="6007:87422">
        <p className="text-sm font-semibold text-[#c5c6d0]" role="status" aria-live="polite">{currentStreamLabel}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" disabled={publishingControlsDisabled} className="rounded-lg border border-[#272a31] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:opacity-60" aria-label="Toggle microphone">Mic</button>
          <button type="button" disabled={publishingControlsDisabled} className="rounded-lg border border-[#272a31] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:opacity-60" aria-label="Toggle camera">Camera</button>
        </div>
        <div className="relative flex flex-wrap items-center justify-end gap-3">
          <button type="button" disabled={controlsDisabled} className="rounded-lg border border-[#272a31] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:opacity-60" aria-label="Open chat">Chat</button>
          <button type="button" disabled={controlsDisabled} className="rounded-lg border border-[#272a31] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:opacity-60" aria-label="View participants">Participants</button>
          <button type="button" disabled={controlsDisabled} onClick={() => setIsMenuOpen((open) => !open)} aria-expanded={isMenuOpen} aria-controls="viewer-session-menu" className="rounded-lg border border-[#272a31] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:opacity-60">More</button>
          {isMenuOpen && <div id="viewer-session-menu" role="menu" className="absolute bottom-14 right-0 z-10 w-48 rounded-lg border border-[#272a31] bg-[#191b23] p-2 shadow-xl"><button type="button" role="menuitem" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-[#2e3038] focus:bg-[#2e3038] focus:outline-none">Playback quality</button><button type="button" role="menuitem" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-[#2e3038] focus:bg-[#2e3038] focus:outline-none">Fullscreen</button></div>}
        </div>
      </footer>
    </main>
  );
}
