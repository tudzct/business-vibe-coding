import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { joinSession } from './api/session';

type ParticipantRole = 'HOST' | 'BROADCASTER' | 'VIEWER' | 'STAGE_PARTICIPANT';
type PermissionStatus = 'UNKNOWN' | 'GRANTED' | 'DENIED';

interface PreviewState {
  participantKey: string;
  cameraPermission: PermissionStatus;
  microphonePermission: PermissionStatus;
  cameraAvailable: boolean;
  microphoneAvailable: boolean;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  isReadyToJoin: boolean;
}

const participantKey = 'local-preview';

function ControlIcon({ kind }: { kind: 'camera' | 'mic' | 'settings' | 'effects' }) {
  const glyph = { camera: '▣', mic: '♩', settings: '⋮', effects: '✦' }[kind];
  return <span aria-hidden="true" className="control-icon">{glyph}</span>;
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [role] = useState<ParticipantRole>('HOST');
  const [displayName, setDisplayName] = useState('');
  const [cameraRequested] = useState(true);
  const [microphoneRequested] = useState(true);
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>('UNKNOWN');
  const [microphonePermission, setMicrophonePermission] = useState<PermissionStatus>('UNKNOWN');
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [microphoneAvailable, setMicrophoneAvailable] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showDenied, setShowDenied] = useState(false);
  const [openMenu, setOpenMenu] = useState<'camera' | 'microphone' | null>(null);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);
  const [joinResult, setJoinResult] = useState('');

  const isReadyToJoin = useMemo(() => {
    const trimmed = displayName.trim();
    return trimmed.length > 0 && trimmed.length <= 50;
  }, [displayName]);

  const preparePreview = useCallback(async () => {
    if (busy || role === 'VIEWER') return;
    setBusy(true);
    setError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Media access is unavailable in this browser.');
      }
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: cameraRequested,
        audio: microphoneRequested,
      });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = nextStream;
      if (videoRef.current) {
        videoRef.current.srcObject = nextStream;
        await videoRef.current.play().catch(() => undefined);
      }
      const hasVideo = nextStream.getVideoTracks().length > 0;
      const hasAudio = nextStream.getAudioTracks().length > 0;
      setCameraAvailable(hasVideo);
      setMicrophoneAvailable(hasAudio);
      setCameraPermission(cameraRequested && hasVideo ? 'GRANTED' : cameraRequested ? 'DENIED' : 'UNKNOWN');
      setMicrophonePermission(microphoneRequested && hasAudio ? 'GRANTED' : microphoneRequested ? 'DENIED' : 'UNKNOWN');
      setCameraEnabled(cameraRequested && hasVideo);
      setMicrophoneEnabled(microphoneRequested && hasAudio);
      setShowDenied(false);
    } catch {
      setCameraPermission(cameraRequested ? 'DENIED' : 'UNKNOWN');
      setMicrophonePermission(microphoneRequested ? 'DENIED' : 'UNKNOWN');
      setCameraEnabled(false);
      setMicrophoneEnabled(false);
      setShowDenied(true);
      setError('Access to Microphone and Camera is required.');
    } finally {
      setBusy(false);
    }
  }, [busy, cameraRequested, microphoneRequested, role]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const toggleCamera = () => {
    if (cameraPermission !== 'GRANTED' || !cameraAvailable) return;
    setCameraEnabled((enabled) => !enabled);
    streamRef.current?.getVideoTracks().forEach((track) => { track.enabled = !cameraEnabled; });
  };

  const toggleMicrophone = () => {
    if (microphonePermission !== 'GRANTED' || !microphoneAvailable) return;
    setMicrophoneEnabled((enabled) => !enabled);
    streamRef.current?.getAudioTracks().forEach((track) => { track.enabled = !microphoneEnabled; });
  };

  const nameInvalid = displayName.length > 0 && !isReadyToJoin;
  const join = async () => {
    const trimmed = displayName.trim();
    if (!trimmed || trimmed.length > 50 || busy) return;
    setBusy(true);
    setError('');
    try {
      const sessionId = window.location.pathname.split('/').filter(Boolean).pop() ?? '00000000-0000-4000-8000-000000000000';
      const result = await joinSession(sessionId, { displayName: trimmed, microphoneEnabled, cameraEnabled, microphoneDeviceId: null, cameraDeviceId: null, speakerDeviceId: null, virtualBackgroundId: null }, import.meta.env.VITE_SESSION_ACCESS_TOKEN ?? '');
      setJoined(true);
      setJoinResult(result.message);
      setCameraEnabled(result.data.participant.cameraEnabled);
      setMicrophoneEnabled(result.data.participant.microphoneEnabled);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'The session could not be joined.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };
  const previewState: PreviewState = {
    participantKey,
    cameraPermission,
    microphonePermission,
    cameraAvailable,
    microphoneAvailable,
    cameraEnabled: role === 'VIEWER' ? false : cameraEnabled,
    microphoneEnabled: role === 'VIEWER' ? false : microphoneEnabled,
    isReadyToJoin,
  };

  return (
    <main className="preview-shell">
      <section className="preview-card" aria-label="Pre-join preview">
        <div className="brand-mark" aria-label="Application logo">✣</div>
        <div className="heading-block">
          <h1>Get Started</h1>
          <p>Setup your audio and video before joining</p>
        </div>
        <div className="first-chip">You are the first to join</div>

        <div className="video-tile">
          <video ref={videoRef} muted playsInline aria-label="Camera preview" className={previewState.cameraEnabled ? 'video-visible' : 'video-hidden'} />
          {!previewState.cameraEnabled && <div className="avatar">KA</div>}
          <span className="mic-status" aria-label={previewState.microphoneEnabled ? 'Microphone on' : 'Microphone muted'}>
            {previewState.microphoneEnabled ? '♩' : '⌁'}
          </span>
        </div>

        <div className="control-row">
          <div className="control-group">
            <div className="control-menu-wrap">
              <button type="button" className="control-button wide" onClick={toggleCamera} aria-label="Toggle camera" disabled={busy}>
                <ControlIcon kind="camera" /><span>{previewState.cameraEnabled ? 'Camera' : 'Camera off'}</span><span>⋮</span>
              </button>
              <button type="button" className="menu-trigger" aria-label="Open camera menu" onClick={() => setOpenMenu(openMenu === 'camera' ? null : 'camera')}>⋮</button>
              {openMenu === 'camera' && <div className="device-menu" role="menu"><button type="button" role="menuitem" onClick={() => setOpenMenu(null)}>Default camera</button><button type="button" role="menuitem" onClick={() => setOpenMenu(null)}>Integrated Camera</button></div>}
            </div>
            <div className="control-menu-wrap">
              <button type="button" className="control-button wide" onClick={toggleMicrophone} aria-label="Toggle microphone" disabled={busy}>
                <ControlIcon kind="mic" /><span>{previewState.microphoneEnabled ? 'Microphone' : 'Mic off'}</span><span>⋮</span>
              </button>
              <button type="button" className="menu-trigger" aria-label="Open microphone menu" onClick={() => setOpenMenu(openMenu === 'microphone' ? null : 'microphone')}>⋮</button>
              {openMenu === 'microphone' && <div className="device-menu" role="menu"><button type="button" role="menuitem" onClick={() => setOpenMenu(null)}>Default - MacBook Pro Microphone (Built-in)</button><button type="button" role="menuitem" onClick={() => setOpenMenu(null)}>MacBook Pro Microphone (Built-in)</button><button type="button" role="menuitem" onClick={() => setOpenMenu(null)}>Bose Microphone</button></div>}
            </div>
            <button type="button" className="icon-button" aria-label="Effects and backgrounds"><ControlIcon kind="effects" /></button>
          </div>
          <button type="button" className="icon-button" aria-label="Preview settings"><ControlIcon kind="settings" /></button>
        </div>

        <div className="name-row">
          <div className="name-field">
            <label htmlFor="display-name">Display name</label>
            <input id="display-name" value={displayName} maxLength={51} onChange={(event) => setDisplayName(event.target.value)} placeholder="Enter name" aria-invalid={nameInvalid} />
            {nameInvalid && <span className="validation-message">Enter 1–50 characters.</span>}
          </div>
          <button type="button" className="go-live" disabled={!isReadyToJoin || busy || joined} onClick={() => void join()}>➜ <span>{busy ? 'Joining…' : joined ? 'Joined' : 'Join'}</span></button>
        </div>
        {joinResult && <p role="status" className="join-success">{joinResult}</p>}
        {error && !showDenied && <p role="alert" className="join-error">{error}</p>}
        <button type="button" className="permission-action" disabled={busy} onClick={() => void preparePreview()}>{busy ? 'Requesting access…' : 'Allow microphone and camera'}</button>
      </section>

      {showDenied && <div className="scrim" role="presentation"><section className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="permission-title">
        <h2 id="permission-title">Allow to use your microphone and camera</h2>
        <p>Access to Microphone and Camera is required. Enable permissions for Microphone and Camera by clicking “Allow” on the pop-up.</p>
        {error && <p className="dialog-error">{error}</p>}
        <div className="dialog-actions"><button type="button" onClick={() => setShowDenied(false)}>Dismiss</button><button type="button" onClick={() => void preparePreview()} disabled={busy}>Retry</button></div>
      </section></div>}
    </main>
  );
}
