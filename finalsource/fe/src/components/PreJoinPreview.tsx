import { useEffect, useRef, useState } from 'react';

type PermissionStatus = 'UNKNOWN' | 'GRANTED' | 'DENIED';
export type ParticipantRole = 'BROADCASTER' | 'VIEWER';

interface PreJoinPreviewProps {
  role?: ParticipantRole;
  participantKey?: string;
}

const microphoneChoices = [
  'Default - MacBook Pro Microphone (Built-in)',
  'MacBook Pro Microphone (Built-in)',
  'Bose Microphone',
];

function stopTracks(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}

export default function PreJoinPreview({
  role = 'BROADCASTER',
  participantKey = crypto.randomUUID(),
}: PreJoinPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [requestCamera, setRequestCamera] = useState(false);
  const [requestMicrophone, setRequestMicrophone] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>('UNKNOWN');
  const [microphonePermission, setMicrophonePermission] = useState<PermissionStatus>('UNKNOWN');
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [microphoneAvailable, setMicrophoneAvailable] = useState(true);
  const [selectedMicrophone, setSelectedMicrophone] = useState(microphoneChoices[0]);
  const [isPreparing, setIsPreparing] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const isViewer = role === 'VIEWER';
  const cameraEnabled =
    !isViewer && requestCamera && cameraAvailable && cameraPermission === 'GRANTED';
  const microphoneEnabled =
    !isViewer &&
    requestMicrophone &&
    microphoneAvailable &&
    microphonePermission === 'GRANTED';
  const isReadyToJoin =
    displayName.trim().length > 0 && displayName.trim().length <= 50;

  useEffect(() => {
    return () => stopTracks(streamRef.current);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = cameraEnabled ? streamRef.current : null;
    }
  }, [cameraEnabled]);

  async function preparePreview(nextCamera: boolean, nextMicrophone: boolean): Promise<void> {
    const shouldRequestCamera = !isViewer && nextCamera;
    const shouldRequestMicrophone = !isViewer && nextMicrophone;

    setRequestCamera(shouldRequestCamera);
    setRequestMicrophone(shouldRequestMicrophone);
    setShowPermissionDialog(false);

    if (!shouldRequestCamera && !shouldRequestMicrophone) {
      stopTracks(streamRef.current);
      streamRef.current = null;
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraAvailable(false);
      setMicrophoneAvailable(false);
      setCameraPermission(shouldRequestCamera ? 'DENIED' : 'UNKNOWN');
      setMicrophonePermission(shouldRequestMicrophone ? 'DENIED' : 'UNKNOWN');
      setShowPermissionDialog(true);
      return;
    }

    setIsPreparing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: shouldRequestCamera,
        audio: shouldRequestMicrophone,
      });

      stopTracks(streamRef.current);
      streamRef.current = stream;
      setCameraAvailable(!shouldRequestCamera || stream.getVideoTracks().length > 0);
      setMicrophoneAvailable(
        !shouldRequestMicrophone || stream.getAudioTracks().length > 0,
      );
      setCameraPermission(shouldRequestCamera ? 'GRANTED' : 'UNKNOWN');
      setMicrophonePermission(shouldRequestMicrophone ? 'GRANTED' : 'UNKNOWN');
      if (videoRef.current && shouldRequestCamera) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      if (shouldRequestCamera) setCameraPermission('DENIED');
      if (shouldRequestMicrophone) setMicrophonePermission('DENIED');
      setShowPermissionDialog(true);
    } finally {
      setIsPreparing(false);
    }
  }

  function toggleCamera(): void {
    void preparePreview(!requestCamera, requestMicrophone);
  }

  function toggleMicrophone(): void {
    void preparePreview(requestCamera, !requestMicrophone);
  }

  return (
    <main className="prejoin-page">
      <section className="prejoin-card" aria-labelledby="prejoin-title">
        <div className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <header className="prejoin-header">
          <h1 id="prejoin-title">Get Started</h1>
          <p>Setup your audio and video before joining</p>
        </header>

        <p className="first-joiner">You are the first to join</p>

        <div className="preview-stack">
          <div className="video-tile">
            {cameraEnabled ? (
              <video ref={videoRef} autoPlay muted playsInline aria-label="Camera preview" />
            ) : (
              <div className="avatar" aria-label="Camera preview muted">
                {displayName.trim()
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('') || 'KA'}
              </div>
            )}
            <span
              className={`status-icon ${microphoneEnabled ? 'is-on' : 'is-muted'}`}
              aria-label={microphoneEnabled ? 'Microphone on' : 'Microphone muted'}
            >
              {microphoneEnabled ? '●' : '／'}
            </span>
          </div>

          <div className="control-row">
            <div className="media-controls" aria-label="Media controls">
              <button
                className={`icon-control ${cameraEnabled ? 'is-active' : ''}`}
                type="button"
                onClick={toggleCamera}
                disabled={isPreparing || isViewer}
                aria-pressed={cameraEnabled}
                aria-label={cameraEnabled ? 'Turn camera off' : 'Turn camera on'}
              >
                <span aria-hidden="true">▰</span>
              </button>
              <button
                className={`icon-control ${microphoneEnabled ? 'is-active' : ''}`}
                type="button"
                onClick={toggleMicrophone}
                disabled={isPreparing || isViewer}
                aria-pressed={microphoneEnabled}
                aria-label={microphoneEnabled ? 'Turn microphone off' : 'Turn microphone on'}
              >
                <span aria-hidden="true">♩</span>
              </button>
              <label className="device-picker">
                <span className="sr-only">Microphone device</span>
                <select
                  value={selectedMicrophone}
                  onChange={(event) => setSelectedMicrophone(event.target.value)}
                  disabled={isPreparing || isViewer}
                >
                  {microphoneChoices.map((choice) => (
                    <option key={choice}>{choice}</option>
                  ))}
                </select>
                <span aria-hidden="true">⌄</span>
              </label>
            </div>
            <span
              className="preview-state"
              aria-live="polite"
              data-participant-key={participantKey}
            >
              {isPreparing ? 'Preparing preview…' : 'Preview'}
            </span>
          </div>

          <div className="join-row">
            <label className="name-field">
              <span className="sr-only">Display name</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={50}
                placeholder="Enter name"
                aria-describedby="name-hint"
              />
            </label>
            <button className="join-button" type="button" disabled={!isReadyToJoin}>
              <span aria-hidden="true">↗</span>
              {role === 'BROADCASTER' ? 'Go Live' : 'Join Now'}
            </button>
          </div>
          <p className="name-hint" id="name-hint">
            {isReadyToJoin ? 'Ready to join' : 'Enter a name from 1 to 50 characters'}
          </p>
        </div>
      </section>

      {showPermissionDialog && (
        <div className="dialog-scrim" role="presentation">
          <section
            className="permission-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="permission-title"
          >
            <h2 id="permission-title">Allow to use your microphone and camera</h2>
            <p>
              Access to Microphone and Camera is required. Enable permissions for
              Microphone and Camera by clicking “Allow” on the pop-up.
            </p>
            <div className="dialog-actions">
              <button
                className="dismiss-button"
                type="button"
                onClick={() => setShowPermissionDialog(false)}
              >
                Dismiss
              </button>
              <button
                className="retry-button"
                type="button"
                onClick={() => void preparePreview(requestCamera, requestMicrophone)}
                disabled={isPreparing}
              >
                {isPreparing ? 'Preparing preview…' : 'Retry'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
