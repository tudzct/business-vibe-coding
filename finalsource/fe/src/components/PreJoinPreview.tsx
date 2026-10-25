import { useRef, useState } from 'react';
import { joinSession, type JoinSessionData, SessionApiError } from '../api/session';

type MediaControl = 'camera' | 'microphone';

function initials(name: string): string {
  return name.trim().split(/\s+/).map((part) => part[0] ?? '').join('').slice(0, 2).toUpperCase() || 'ME';
}

export function PreJoinPreview() {
  const [displayName, setDisplayName] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [joinedSession, setJoinedSession] = useState<JoinSessionData | null>(null);
  const idempotencyKey = useRef<string | null>(null);

  const trimmedName = displayName.trim();
  const nameError = displayName.length > 0 && trimmedName.length === 0
    ? 'Enter a name to continue.'
    : trimmedName.length > 50 ? 'Name must be 50 characters or fewer.' : null;
  const canJoin = Boolean(trimmedName) && !nameError && !isJoining;

  const toggleMedia = (control: MediaControl): void => {
    if (isJoining) return;
    if (control === 'camera') setCameraEnabled((enabled) => !enabled);
    else setMicrophoneEnabled((enabled) => !enabled);
  };

  const submitJoin = async (): Promise<void> => {
    if (!canJoin) return;
    const sessionId = new URLSearchParams(window.location.search).get('sessionId');
    const accessToken = window.sessionStorage.getItem('sessionAccessToken');
    if (!sessionId || !accessToken) {
      setJoinError('A session and authenticated access context are required to join.');
      return;
    }

    setJoinError(null);
    setIsJoining(true);
    idempotencyKey.current ??= crypto.randomUUID();
    try {
      setJoinedSession(await joinSession(sessionId, accessToken, idempotencyKey.current, {
        displayName: trimmedName,
        microphoneEnabled,
        cameraEnabled,
        microphoneDeviceId: null,
        cameraDeviceId: null,
        speakerDeviceId: null,
        virtualBackgroundId: null,
      }));
    } catch (error: unknown) {
      setJoinError(error instanceof SessionApiError ? error.message : 'The session could not be joined. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (joinedSession) {
    return (
      <main className="min-h-screen bg-black px-4 py-10 font-sans text-[#eff0fa]">
        <section className="mx-auto w-full max-w-[480px]" aria-labelledby="joined-heading">
          <p className="text-sm font-semibold text-[#84aaff]">You are connected</p>
          <h1 id="joined-heading" className="mt-2 text-[34px] font-semibold leading-10 tracking-[0.25px]">Active session</h1>
          <div className="mt-6 rounded-2xl border border-[#272a31] bg-[#191b23] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#7e47eb] text-3xl font-semibold" aria-label={`${joinedSession.participant.displayName} participant tile`}>{initials(joinedSession.participant.displayName)}</div>
              <div><p className="text-lg font-semibold">{joinedSession.participant.displayName}</p><p className="text-sm text-[#c5c6d0]">{joinedSession.session.kind.replaceAll('_', ' ').toLowerCase()}</p></div>
            </div>
            <p className="mt-5 text-sm text-[#c5c6d0]">Camera {joinedSession.participant.cameraEnabled ? 'on' : 'off'} · Microphone {joinedSession.participant.microphoneEnabled ? 'on' : 'off'}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 font-sans text-[#eff0fa] sm:px-6" data-node-id="6066:89824">
      <section className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-10" aria-labelledby="preview-heading">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#538dff] text-lg font-bold text-[#11131a]" aria-label="Video conferencing">✦</div>
        <div className="space-y-2 text-center"><h1 id="preview-heading" className="text-[34px] font-semibold leading-10 tracking-[0.25px]">Get Started</h1><p className="text-base leading-6 tracking-[0.5px] text-[#c5c6d0]">Setup your audio and video before joining</p></div>
        <p className="rounded-full border border-[#1d1f27] bg-[#191b23] px-4 py-2 text-sm font-semibold leading-5 tracking-[0.25px]">You are the first to join</p>
        <div className="flex w-full flex-col gap-6">
          <div className="relative flex h-[min(70vw,338px)] min-h-56 items-center justify-center overflow-hidden rounded-2xl bg-[#11131a] sm:h-[338px]" aria-label="Video preview"><div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#7e47eb] text-4xl font-semibold">{initials(displayName)}</div><span className="absolute right-3 top-3 rounded-full bg-[#293042] px-3 py-2 text-sm">{microphoneEnabled ? 'Microphone on' : 'Microphone off'}</span></div>
          <div className="flex items-center justify-between gap-3"><div className="flex gap-4"><button type="button" onClick={() => toggleMedia('microphone')} disabled={isJoining} aria-pressed={microphoneEnabled} className="rounded-lg border border-[#272a31] bg-[#191b23] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:opacity-50">{microphoneEnabled ? 'Mic on' : 'Mic off'}</button><button type="button" onClick={() => toggleMedia('camera')} disabled={isJoining} aria-pressed={cameraEnabled} className="rounded-lg border border-[#272a31] bg-[#191b23] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:opacity-50">{cameraEnabled ? 'Camera on' : 'Camera off'}</button></div><div className="flex gap-2"><button type="button" onClick={() => setNotice('Background settings are available after joining.')} disabled={isJoining} className="rounded-lg border border-[#272a31] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:opacity-50" aria-label="Open background settings">✦</button><button type="button" onClick={() => setNotice('More preview options are not available yet.')} disabled={isJoining} className="rounded-lg border border-[#272a31] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:opacity-50" aria-label="More preview options">•••</button></div></div>
          {notice && <p className="rounded-lg border border-amber-400/50 bg-amber-400/10 p-3 text-sm text-amber-100" role="status">{notice}</p>}
          {joinError && <p className="rounded-lg border border-red-400/50 bg-red-400/10 p-3 text-sm text-red-100" role="alert">{joinError}</p>}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start"><div className="flex-1"><label className="sr-only" htmlFor="display-name">Name</label><input id="display-name" value={displayName} maxLength={51} onChange={(event) => setDisplayName(event.target.value)} disabled={isJoining} placeholder="Enter name" aria-describedby={nameError ? 'name-error' : undefined} className="h-12 w-full rounded-lg bg-[#191b23] px-4 text-base text-[#eff0fa] placeholder:text-[#8f9099] outline-none ring-[#538dff] focus:ring-2 disabled:opacity-60" />{nameError && <p id="name-error" className="mt-2 text-sm text-red-300" role="alert">{nameError}</p>}</div><button type="button" onClick={() => void submitJoin()} disabled={!canJoin} className="flex h-12 items-center justify-center rounded-lg bg-[#2572ed] px-5 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:cursor-not-allowed disabled:opacity-60">{isJoining ? 'Joining…' : 'Join Now'}</button></div>
        </div>
      </section>
    </main>
  );
}
