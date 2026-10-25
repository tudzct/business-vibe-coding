import { useCallback, useEffect, useRef, useState } from 'react';

type PermissionStatus = 'UNKNOWN' | 'GRANTED' | 'DENIED';
type MediaControl = 'camera' | 'microphone';

function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}

function isPermissionError(error: unknown): boolean {
  return error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError');
}

function isUnavailableError(error: unknown): boolean {
  return error instanceof DOMException && (error.name === 'NotFoundError' || error.name === 'NotReadableError');
}

export function PreJoinPreview() {
  const activeStream = useRef<MediaStream | null>(null);
  const videoElement = useRef<HTMLVideoElement | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>('UNKNOWN');
  const [microphonePermission, setMicrophonePermission] = useState<PermissionStatus>('UNKNOWN');
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [microphoneAvailable, setMicrophoneAvailable] = useState(true);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isReadyToJoin, setIsReadyToJoin] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);

  const trimmedName = displayName.trim();
  const nameError = displayName.length > 0 && trimmedName.length === 0
    ? 'Enter a name to continue.'
    : trimmedName.length > 50
      ? 'Name must be 50 characters or fewer.'
      : null;
  const preparePreview = useCallback(async (requestCamera = cameraEnabled, requestMicrophone = microphoneEnabled): Promise<void> => {
    if (isPreparing) return;

    setIsPreparing(true);
    setPermissionDenied(false);
    setAvailabilityMessage(null);
    setIsReadyToJoin(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraAvailable(false);
      setMicrophoneAvailable(false);
      setAvailabilityMessage('Media preview is unavailable in this browser.');
      setIsPreparing(false);
      return;
    }

    if (!requestCamera && !requestMicrophone) {
      stopStream(activeStream.current);
      activeStream.current = null;
      setIsReadyToJoin(true);
      setIsPreparing(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: requestCamera,
        audio: requestMicrophone,
      });

      stopStream(activeStream.current);
      activeStream.current = stream;
      if (videoElement.current) videoElement.current.srcObject = stream;

      if (requestCamera) {
        setCameraPermission('GRANTED');
        setCameraAvailable(true);
        setCameraEnabled(true);
      }
      if (requestMicrophone) {
        setMicrophonePermission('GRANTED');
        setMicrophoneAvailable(true);
        setMicrophoneEnabled(true);
      }
      setIsReadyToJoin(true);
    } catch (error: unknown) {
      stopStream(activeStream.current);
      activeStream.current = null;
      if (isPermissionError(error)) {
        if (requestCamera) { setCameraPermission('DENIED'); setCameraEnabled(false); }
        if (requestMicrophone) { setMicrophonePermission('DENIED'); setMicrophoneEnabled(false); }
        setPermissionDenied(true);
      } else if (isUnavailableError(error)) {
        if (requestCamera) { setCameraAvailable(false); setCameraEnabled(false); }
        if (requestMicrophone) { setMicrophoneAvailable(false); setMicrophoneEnabled(false); }
        setAvailabilityMessage('The selected camera or microphone is unavailable. You can continue with an available medium.');
      } else {
        setAvailabilityMessage('We could not prepare your media preview. Please try again.');
      }
    } finally {
      setIsPreparing(false);
    }
  }, [cameraEnabled, isPreparing, microphoneEnabled]);

  useEffect(() => {
    const video = videoElement.current;
    if (video && activeStream.current) video.srcObject = activeStream.current;

    return () => {
      if (video) video.srcObject = null;
      stopStream(activeStream.current);
      activeStream.current = null;
    };
  }, []);

  const toggleMedia = (control: MediaControl): void => {
    const wasEnabled = control === 'camera' ? cameraEnabled : microphoneEnabled;
    const permission = control === 'camera' ? cameraPermission : microphonePermission;
    if (!wasEnabled && permission !== 'GRANTED') {
      void preparePreview(control === 'camera' || cameraEnabled, control === 'microphone' || microphoneEnabled);
      return;
    }
    const enabled = !wasEnabled;
    const tracks = control === 'camera' ? activeStream.current?.getVideoTracks() : activeStream.current?.getAudioTracks();
    tracks?.forEach((track) => {
      track.enabled = enabled;
    });

    if (control === 'camera') setCameraEnabled(enabled);
    else setMicrophoneEnabled(enabled);
    setIsReadyToJoin(Boolean(activeStream.current) || (!cameraEnabled && !microphoneEnabled));
  };

  const canJoin = trimmedName.length > 0 && trimmedName.length <= 50 && !nameError && !isPreparing && isReadyToJoin;
  const cameraMuted = !cameraEnabled || !cameraAvailable || cameraPermission === 'DENIED';
  const microphoneMuted = !microphoneEnabled || !microphoneAvailable || microphonePermission === 'DENIED';

  return (
    <main className="min-h-screen bg-[#000] px-4 py-10 font-sans text-[#eff0fa] sm:px-6">
      <section className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-10" aria-labelledby="preview-heading">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#538dff] text-lg font-bold text-[#11131a]" aria-label="Video conferencing">
          ✦
        </div>

        <div className="space-y-2 text-center">
          <h1 id="preview-heading" className="text-[34px] font-semibold leading-10 tracking-[0.25px]">Get Started</h1>
          <p className="text-base leading-6 tracking-[0.5px] text-[#c5c6d0]">Setup your audio and video before joining</p>
        </div>

        <p className="rounded-full border border-[#1d1f27] bg-[#191b23] px-4 py-2 text-sm font-semibold leading-5 tracking-[0.25px]">You are the first to join</p>

        <div className="flex w-full flex-col gap-6">
          <div className="relative flex h-[min(70vw,338px)] min-h-56 items-center justify-center overflow-hidden rounded-2xl bg-[#11131a] sm:h-[338px]">
            {!cameraMuted && activeStream.current ? (
              <video
                ref={(node) => {
                  videoElement.current = node;
                  if (node && activeStream.current) node.srcObject = activeStream.current;
                }}
                className="h-full w-full object-cover"
                autoPlay
                muted
                playsInline
                aria-label="Camera preview"
              />
            ) : (
              <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#7e47eb] text-4xl" aria-label="Camera preview muted">◉</div>
            )}
            <span className="absolute right-2 top-2 rounded-full bg-[#293042] p-2 text-sm" aria-label={microphoneMuted ? 'Microphone muted' : 'Microphone on'}>
              {microphoneMuted ? '🔇' : '🎙'}
            </span>
            {isPreparing && <p className="absolute inset-x-4 bottom-4 rounded-lg bg-black/70 px-3 py-2 text-center text-sm" role="status">Preparing preview…</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <button type="button" onClick={() => toggleMedia('microphone')} disabled={isPreparing} aria-pressed={!microphoneMuted} className="rounded-lg bg-[#2e3038] px-4 py-3 text-xl focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:opacity-50">
                <span aria-hidden="true">{microphoneMuted ? '🔇' : '🎙'}</span><span className="sr-only">Toggle microphone</span>
              </button>
              <button type="button" onClick={() => toggleMedia('camera')} disabled={isPreparing} aria-pressed={!cameraMuted} className="rounded-lg bg-[#2e3038] px-4 py-3 text-xl focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:opacity-50">
                <span aria-hidden="true">{cameraMuted ? '📷' : '📹'}</span><span className="sr-only">Toggle camera</span>
              </button>
            </div>
            <button type="button" onClick={() => void preparePreview(true, true)} disabled={isPreparing} className="rounded-lg border border-[#272a31] px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:opacity-50">
              {isPreparing ? 'Requesting…' : 'Enable preview'}
            </button>
          </div>

          {availabilityMessage && <p className="rounded-lg border border-amber-400/50 bg-amber-400/10 p-3 text-sm text-amber-100" role="status">{availabilityMessage}</p>}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="flex-1">
              <label className="sr-only" htmlFor="display-name">Name</label>
              <input id="display-name" value={displayName} maxLength={51} onChange={(event) => setDisplayName(event.target.value)} placeholder="Enter name" aria-describedby={nameError ? 'name-error' : undefined} className="h-12 w-full rounded-lg bg-[#191b23] px-4 text-base text-[#eff0fa] placeholder:text-[#8f9099] outline-none ring-[#538dff] focus:ring-2" />
              {nameError && <p id="name-error" className="mt-2 text-sm text-red-300" role="alert">{nameError}</p>}
            </div>
            <button type="button" disabled={!canJoin} className="flex h-12 items-center justify-center rounded-lg bg-[#004299] px-5 text-base font-semibold text-[#84aaff] focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:cursor-not-allowed disabled:opacity-60">
              Go Live
            </button>
          </div>
        </div>
      </section>

      {permissionDenied && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4" role="alertdialog" aria-modal="true" aria-labelledby="permission-title">
          <div className="w-full max-w-md rounded-2xl border border-[#272a31] bg-[#191b23] p-6 shadow-2xl">
            <h2 id="permission-title" className="text-xl font-semibold">Camera or microphone access was not granted</h2>
            <p className="mt-2 text-sm leading-6 text-[#c5c6d0]">Allow access in your browser settings, then try again to update your preview.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setPermissionDenied(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-[#c5c6d0] focus:outline-none focus:ring-2 focus:ring-[#538dff]">Not now</button>
              <button type="button" onClick={() => void preparePreview()} disabled={isPreparing} className="rounded-lg bg-[#538dff] px-4 py-2 text-sm font-semibold text-[#11131a] focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50">Try again</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
