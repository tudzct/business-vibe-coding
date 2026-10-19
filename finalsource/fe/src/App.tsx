import { useEffect, useRef, useState } from 'react';

type ParticipantRole = 'HOST' | 'BROADCASTER' | 'VIEWER' | 'STAGE_PARTICIPANT';
type PermissionStatus = 'UNKNOWN' | 'GRANTED' | 'DENIED';
type RequestStatus = 'idle' | 'requesting' | 'unavailable';

const roles: readonly ParticipantRole[] = ['BROADCASTER', 'HOST', 'VIEWER', 'STAGE_PARTICIPANT'];

function createParticipantKey(): string {
  return 'randomUUID' in crypto ? crypto.randomUUID() : `preview-${Date.now()}`;
}

function permissionLabel(status: PermissionStatus, available: boolean): string {
  if (!available) return 'Unavailable';
  if (status === 'GRANTED') return 'On';
  if (status === 'DENIED') return 'Denied';
  return 'Off';
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [participantKey] = useState(createParticipantKey);
  const [role, setRole] = useState<ParticipantRole>('BROADCASTER');
  const [displayName, setDisplayName] = useState('');
  const [requestCamera, setRequestCamera] = useState(true);
  const [requestMicrophone, setRequestMicrophone] = useState(true);
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>('UNKNOWN');
  const [microphonePermission, setMicrophonePermission] = useState<PermissionStatus>('UNKNOWN');
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [microphoneAvailable, setMicrophoneAvailable] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('idle');
  const [showDeniedDialog, setShowDeniedDialog] = useState(false);

  const isViewer = role === 'VIEWER';
  const isReadyToJoin = displayName.trim().length > 0 && displayName.trim().length <= 50;
  const nameError = displayName.length > 0 && !isReadyToJoin ? 'Enter a name between 1 and 50 characters.' : '';

  const stopPreview = (): void => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => () => stopPreview(), []);

  const preparePreview = async (): Promise<void> => {
    setShowDeniedDialog(false);
    if (isViewer) {
      stopPreview();
      setCameraEnabled(false);
      setMicrophoneEnabled(false);
      setRequestStatus('idle');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      stopPreview();
      setCameraAvailable(false);
      setMicrophoneAvailable(false);
      setCameraEnabled(false);
      setMicrophoneEnabled(false);
      setRequestStatus('unavailable');
      return;
    }

    setRequestStatus('requesting');
    stopPreview();
    const cameraResult = requestCamera
      ? await navigator.mediaDevices.getUserMedia({ video: true }).then(
          (stream): PromiseSettledResult<MediaStream> => ({ status: 'fulfilled', value: stream }),
          (reason): PromiseSettledResult<MediaStream> => ({ status: 'rejected', reason }),
        )
      : undefined;
    const microphoneResult = requestMicrophone
      ? await navigator.mediaDevices.getUserMedia({ audio: true }).then(
          (stream): PromiseSettledResult<MediaStream> => ({ status: 'fulfilled', value: stream }),
          (reason): PromiseSettledResult<MediaStream> => ({ status: 'rejected', reason }),
        )
      : undefined;
    const streams: MediaStream[] = [];
    const cameraGranted = cameraResult?.status === 'fulfilled';
    const microphoneGranted = microphoneResult?.status === 'fulfilled';

    if (cameraResult) {
      setCameraAvailable(cameraGranted);
      setCameraPermission(cameraGranted ? 'GRANTED' : 'DENIED');
      setCameraEnabled(cameraGranted);
      if (cameraGranted) streams.push(cameraResult.value);
    } else {
      setCameraEnabled(false);
    }
    if (microphoneResult) {
      setMicrophoneAvailable(microphoneGranted);
      setMicrophonePermission(microphoneGranted ? 'GRANTED' : 'DENIED');
      setMicrophoneEnabled(microphoneGranted);
      if (microphoneGranted) streams.push(microphoneResult.value);
    } else {
      setMicrophoneEnabled(false);
    }
    if (streams.length > 0) {
      const combinedStream = new MediaStream();
      streams.forEach((stream) => stream.getTracks().forEach((track) => combinedStream.addTrack(track)));
      streamRef.current = combinedStream;
      if (videoRef.current) videoRef.current.srcObject = combinedStream;
    }
    setShowDeniedDialog(Boolean((cameraResult && !cameraGranted) || (microphoneResult && !microphoneGranted)));
    setRequestStatus('idle');
  };

  const handleRoleChange = (nextRole: ParticipantRole): void => {
    setRole(nextRole);
    if (nextRole === 'VIEWER') {
      stopPreview();
      setCameraEnabled(false);
      setMicrophoneEnabled(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-[#eff0fa] sm:px-6 lg:py-[86px]">
      <section className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-6 lg:gap-10">
        <div className="flex w-full items-center gap-3" aria-label="Application logo">
          <span className="grid h-8 w-8 place-items-center rounded-full border-[3px] border-[#538dff] text-sm font-bold text-[#538dff]">+</span>
          <span className="text-sm font-semibold tracking-wide text-[#c5c6d0]">100ms</span>
        </div>
        <header className="text-center">
          <h1 className="text-[34px] font-semibold leading-10 tracking-[0.25px]">Get Started</h1>
          <p className="mt-2 text-base leading-6 tracking-[0.5px] text-[#c5c6d0]">Setup your audio and video before joining</p>
        </header>
        <p className="rounded-full border border-[#1d1f27] bg-[#191b23] px-4 py-2 text-sm font-semibold leading-5 tracking-[0.25px]">You are the first to join</p>

        <div className="w-full space-y-6">
          <div className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-2xl bg-[#11131a] sm:h-[337px]">
            <video ref={videoRef} autoPlay muted playsInline className={`h-full w-full object-cover ${cameraEnabled ? 'block' : 'hidden'}`} aria-label="Local camera preview" />
            {!cameraEnabled && <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-[#7e47eb] text-4xl" aria-hidden="true">◉</div>}
            <span className="absolute right-2 top-2 rounded-full bg-[#293042] px-3 py-1 text-xs font-semibold">{microphoneEnabled ? 'Mic on' : 'Mic muted'}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-4">
              <button type="button" onClick={() => { setRequestCamera(!requestCamera); if (requestCamera) setCameraEnabled(false); }} disabled={isViewer || requestStatus === 'requesting'} className="rounded-lg bg-[#2e3038] px-4 py-3 text-sm font-semibold transition hover:bg-[#40424c] disabled:cursor-not-allowed disabled:opacity-50" aria-pressed={requestCamera}>{requestCamera ? 'Camera on' : 'Camera off'}</button>
              <button type="button" onClick={() => { setRequestMicrophone(!requestMicrophone); if (requestMicrophone) setMicrophoneEnabled(false); }} disabled={isViewer || requestStatus === 'requesting'} className="rounded-lg bg-[#2e3038] px-4 py-3 text-sm font-semibold transition hover:bg-[#40424c] disabled:cursor-not-allowed disabled:opacity-50" aria-pressed={requestMicrophone}>{requestMicrophone ? 'Mic on' : 'Mic off'}</button>
            </div>
            <label className="text-sm text-[#c5c6d0]">Role
              <select value={role} onChange={(event) => handleRoleChange(event.target.value as ParticipantRole)} className="ml-2 rounded-lg border border-[#272a31] bg-[#191b23] px-2 py-3 text-sm text-[#eff0fa]">
                {roles.map((option) => <option key={option} value={option}>{option.replace('_', ' ')}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-2 rounded-lg border border-[#272a31] bg-[#191b23] p-4 text-sm sm:grid-cols-2">
            <span>Camera: {permissionLabel(cameraPermission, cameraAvailable)}</span><span>Microphone: {permissionLabel(microphonePermission, microphoneAvailable)}</span><span className="sm:col-span-2">Local preview key: {participantKey}</span>
          </div>
          {requestStatus === 'unavailable' && <p className="rounded-lg border border-[#6c4b32] bg-[#33251d] p-3 text-sm text-[#ffd8bf]" role="status">Camera and microphone access is unavailable in this browser. Check device availability and try a supported browser.</p>}
          <button type="button" onClick={() => void preparePreview()} disabled={isViewer || requestStatus === 'requesting'} className="w-full rounded-lg border border-[#272a31] bg-[#2e3038] px-4 py-3 text-base font-semibold tracking-[0.5px] transition hover:bg-[#40424c] disabled:cursor-not-allowed disabled:opacity-50">{requestStatus === 'requesting' ? 'Requesting access…' : 'Request camera and microphone access'}</button>
          {isViewer && <p className="rounded-lg border border-[#2b385c] bg-[#17203b] p-3 text-sm text-[#b6ccff]" role="status">Viewers join with camera and microphone muted.</p>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1"><label htmlFor="display-name" className="sr-only">Display name</label><input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={51} placeholder="Enter name" className="h-12 w-full rounded-lg border border-transparent bg-[#191b23] px-4 text-base tracking-[0.5px] text-[#eff0fa] outline-none placeholder:text-[#8f9099] focus:border-[#538dff]" aria-invalid={Boolean(nameError)} aria-describedby={nameError ? 'name-error' : undefined} />{nameError && <p id="name-error" className="mt-2 text-sm text-[#ffb4ab]">{nameError}</p>}</div>
            <button type="button" disabled={!isReadyToJoin || requestStatus === 'requesting'} className="h-12 rounded-lg bg-[#004299] px-6 text-base font-semibold tracking-[0.5px] text-[#84aaff] disabled:cursor-not-allowed disabled:opacity-80" title="Joining is not part of this local preview flow">Go Live</button>
          </div>
        </div>
      </section>
      {showDeniedDialog && <div className="fixed inset-0 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="permission-title"><div className="w-full max-w-md rounded-2xl border border-[#272a31] bg-[#191b23] p-6 shadow-2xl"><h2 id="permission-title" className="text-xl font-semibold">Permission needed</h2><p className="mt-3 text-sm leading-6 text-[#c5c6d0]">Camera or microphone access was not granted. Review your browser permission settings, then try the request again.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowDeniedDialog(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-[#c5c6d0]">Not now</button><button type="button" onClick={() => void preparePreview()} className="rounded-lg bg-[#538dff] px-4 py-2 text-sm font-semibold text-[#061b3e]">Try again</button></div></div></div>}
    </main>
  );
}
