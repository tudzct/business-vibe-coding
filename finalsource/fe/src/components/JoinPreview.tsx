import { useEffect, useRef, useState } from 'react';

type PermissionStatus = 'UNKNOWN' | 'GRANTED' | 'DENIED';
type ParticipantRole = 'HOST' | 'BROADCASTER' | 'VIEWER' | 'STAGE_PARTICIPANT';

type PreviewRequest = {
  requestCamera: boolean;
  requestMicrophone: boolean;
};

const initialRequest: PreviewRequest = {
  requestCamera: false,
  requestMicrophone: false,
};

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export default function JoinPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [participantKey] = useState(() => crypto.randomUUID());
  const [role] = useState<ParticipantRole>('BROADCASTER');
  const [displayName, setDisplayName] = useState('');
  const [request, setRequest] = useState<PreviewRequest>(initialRequest);
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>('UNKNOWN');
  const [microphonePermission, setMicrophonePermission] = useState<PermissionStatus>('UNKNOWN');
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [microphoneAvailable, setMicrophoneAvailable] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);

  const trimmedName = displayName.trim();
  const nameError = trimmedName.length === 0
    ? 'Enter your name to continue.'
    : trimmedName.length > 50
      ? 'Name must be 50 characters or fewer.'
      : '';
  const isReadyToJoin = nameError.length === 0;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  useEffect(() => () => stopStream(streamRef.current), []);

  const preparePreview = async (nextRequest: PreviewRequest) => {
    if (isRequesting) {
      return;
    }

    const effectiveRequest = role === 'VIEWER'
      ? initialRequest
      : nextRequest;

    setRequest(effectiveRequest);
    setShowPermissionDialog(false);

    if (!effectiveRequest.requestCamera && !effectiveRequest.requestMicrophone) {
      stopStream(streamRef.current);
      streamRef.current = null;
      setMediaStream(null);
      setCameraEnabled(false);
      setMicrophoneEnabled(false);
      setCameraAvailable(false);
      setMicrophoneAvailable(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      if (effectiveRequest.requestCamera) {
        setCameraPermission('DENIED');
        setCameraAvailable(false);
        setCameraEnabled(false);
      }
      if (effectiveRequest.requestMicrophone) {
        setMicrophonePermission('DENIED');
        setMicrophoneAvailable(false);
        setMicrophoneEnabled(false);
      }
      setShowPermissionDialog(true);
      return;
    }

    setIsRequesting(true);
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: effectiveRequest.requestCamera,
        audio: effectiveRequest.requestMicrophone,
      });
      stopStream(streamRef.current);
      streamRef.current = nextStream;
      setMediaStream(nextStream);

      const nextCameraAvailable = nextStream.getVideoTracks().length > 0;
      const nextMicrophoneAvailable = nextStream.getAudioTracks().length > 0;
      setCameraAvailable(nextCameraAvailable);
      setMicrophoneAvailable(nextMicrophoneAvailable);
      setCameraPermission(effectiveRequest.requestCamera ? (nextCameraAvailable ? 'GRANTED' : 'DENIED') : 'UNKNOWN');
      setMicrophonePermission(effectiveRequest.requestMicrophone ? (nextMicrophoneAvailable ? 'GRANTED' : 'DENIED') : 'UNKNOWN');
      setCameraEnabled(effectiveRequest.requestCamera && nextCameraAvailable);
      setMicrophoneEnabled(effectiveRequest.requestMicrophone && nextMicrophoneAvailable);
    } catch {
      stopStream(streamRef.current);
      streamRef.current = null;
      setMediaStream(null);
      if (effectiveRequest.requestCamera) {
        setCameraPermission('DENIED');
        setCameraAvailable(false);
        setCameraEnabled(false);
      }
      if (effectiveRequest.requestMicrophone) {
        setMicrophonePermission('DENIED');
        setMicrophoneAvailable(false);
        setMicrophoneEnabled(false);
      }
      setShowPermissionDialog(true);
    } finally {
      setIsRequesting(false);
    }
  };

  const toggleCamera = () => {
    const nextRequest = { ...request, requestCamera: !request.requestCamera };
    void preparePreview(nextRequest);
  };

  const toggleMicrophone = () => {
    const nextRequest = { ...request, requestMicrophone: !request.requestMicrophone };
    void preparePreview(nextRequest);
  };

  const handleJoin = () => {
    setNameTouched(true);
  };

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-[#eff0fa] sm:px-6">
      <section className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-6 sm:gap-8">
        <div className="flex size-8 items-center justify-center text-2xl text-[#538dff]" aria-label="Product mark">✳</div>
        <header className="text-center">
          <h1 className="text-[34px] font-semibold leading-10 tracking-[0.25px]">Get Started</h1>
          <p className="mt-2 text-base leading-6 tracking-[0.5px] text-[#c5c6d0]">Setup your audio and video before joining</p>
        </header>
        <span className="rounded-[40px] border border-[#1d1f27] bg-[#191b23] px-4 py-2 text-sm font-semibold leading-5 tracking-[0.25px]">You are the first to join</span>

        <div className="w-full space-y-6">
          <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-2xl bg-[#11131a]">
            {cameraEnabled && mediaStream ? (
              <video ref={videoRef} autoPlay muted playsInline className="size-full object-cover" aria-label="Camera preview" />
            ) : (
              <div className="flex size-[88px] items-center justify-center rounded-[80px] bg-[#7e47eb] text-4xl" aria-label="Camera preview unavailable">♙</div>
            )}
            <span className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-[20px] bg-[#293042] text-sm" aria-label={microphoneEnabled ? 'Microphone on' : 'Microphone muted'}>{microphoneEnabled ? '🎙' : '🔇'}</span>

            {showPermissionDialog && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/65 p-5">
                <section className="w-full max-w-[380px] rounded-2xl bg-[#191b23] p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="permission-title">
                  <h2 id="permission-title" className="text-xl font-semibold leading-6">Allow to use your microphone and camera</h2>
                  <p className="mt-3 text-base leading-6 text-[#c5c6d0]">Access to Microphone and Camera is required. Enable permissions for Microphone and Camera by clicking “Allow” on the pop-up.</p>
                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowPermissionDialog(false)} className="rounded-lg border border-[#3c4050] px-5 py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#538dff]">Dismiss</button>
                    <button type="button" onClick={() => void preparePreview(request)} disabled={isRequesting} className="rounded-lg bg-[#0879ff] px-5 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#eff0fa]">{isRequesting ? 'Requesting…' : 'Retry'}</button>
                  </div>
                </section>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-3">
              <button type="button" onClick={toggleMicrophone} disabled={isRequesting} aria-label={microphoneEnabled ? 'Turn microphone off' : 'Turn microphone on'} className="rounded-lg bg-[#2e3038] px-4 py-3 text-xl disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#538dff]">{microphoneEnabled ? '🎙' : '🔇'} <span aria-hidden="true">⋮</span></button>
              <button type="button" onClick={toggleCamera} disabled={isRequesting} aria-label={cameraEnabled ? 'Turn camera off' : 'Turn camera on'} className="rounded-lg bg-[#2e3038] px-4 py-3 text-xl disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#538dff]">{cameraEnabled ? '📹' : '📵'} <span aria-hidden="true">⋮</span></button>
              <button type="button" aria-label="Open background and effects" className="rounded-lg border border-[#272a31] px-4 py-3 text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#538dff]">◉</button>
            </div>
            <button type="button" aria-label="Open settings" className="rounded-lg border border-[#272a31] px-4 py-3 text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#538dff]">⚙</button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <label className="sr-only" htmlFor="display-name">Display name</label>
              <input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} onBlur={() => setNameTouched(true)} maxLength={51} placeholder="Enter name" className="h-12 w-full rounded-lg border border-transparent bg-[#191b23] px-4 text-base tracking-[0.5px] text-[#eff0fa] placeholder:text-[#8f9099] focus:border-[#538dff] focus:outline-none" />
              {nameTouched && nameError && <p className="mt-2 text-sm text-red-300" role="alert">{nameError}</p>}
            </div>
            <button type="button" onClick={handleJoin} disabled={!isReadyToJoin || isRequesting} className="h-12 rounded-lg bg-[#0879ff] px-6 text-base font-semibold tracking-[0.5px] disabled:cursor-not-allowed disabled:bg-[#004299] disabled:text-[#84aaff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#eff0fa]">Go Live</button>
          </div>
          <p className="sr-only" aria-live="polite">Preview key {participantKey}. Camera permission {cameraPermission}; microphone permission {microphonePermission}; camera available {String(cameraAvailable)}; microphone available {String(microphoneAvailable)}.</p>
        </div>
      </section>
    </main>
  );
}
