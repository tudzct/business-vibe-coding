import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { joinSession, type JoinResponse } from '../api/sessionJoin';
import SessionParticipantsPanel from './SessionParticipantsPanel';

export type ParticipantRole = 'HOST' | 'BROADCASTER' | 'VIEWER' | 'STAGE_PARTICIPANT';
export type PermissionStatus = 'UNKNOWN' | 'GRANTED' | 'DENIED';

export type PreviewCommand = {
  participantKey: string;
  role: ParticipantRole;
  displayName: string;
  requestCamera: boolean;
  requestMicrophone: boolean;
};

export type PreviewState = {
  participantKey: string;
  cameraPermission: PermissionStatus;
  microphonePermission: PermissionStatus;
  cameraAvailable: boolean;
  microphoneAvailable: boolean;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  isReadyToJoin: boolean;
};

export function preparePreview(command: PreviewCommand): PreviewState {
  const trimmedName = command.displayName.trim();
  const viewer = command.role === 'VIEWER';

  return {
    participantKey: command.participantKey,
    cameraPermission: 'UNKNOWN',
    microphonePermission: 'UNKNOWN',
    cameraAvailable: command.requestCamera,
    microphoneAvailable: command.requestMicrophone,
    cameraEnabled: false,
    microphoneEnabled: false,
    isReadyToJoin: !viewer && trimmedName.length > 0 && trimmedName.length <= 50,
  };
}

type IconName = 'camera' | 'mic' | 'permission' | 'more' | 'arrow' | 'close' | 'person';

function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const common = { className: `h-6 w-6 ${className}`, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (name) {
    case 'camera': return <svg {...common}><path d="M15 8.5 20 6v12l-5-2.5V8.5Z" /><rect x="3" y="6" width="12" height="12" rx="2" /></svg>;
    case 'mic': return <svg {...common}><rect x="8" y="3" width="8" height="12" rx="4" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></svg>;
    case 'permission': return <svg {...common}><path d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></svg>;
    case 'more': return <svg {...common}><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></svg>;
    case 'arrow': return <svg {...common}><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
    case 'close': return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
    case 'person': return <svg {...common}><circle cx="12" cy="8" r="3" /><path d="M5 20c.7-3.5 3.1-5 7-5s6.3 1.5 7 5" /></svg>;
  }
}

function permissionText(status: PermissionStatus): string {
  if (status === 'DENIED') return 'Permission denied';
  if (status === 'GRANTED') return 'Permission granted';
  return 'Permission required';
}

export default function PreJoinPreview() {
  const [displayName, setDisplayName] = useState('');
  const [role] = useState<ParticipantRole>('HOST');
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>('UNKNOWN');
  const [microphonePermission, setMicrophonePermission] = useState<PermissionStatus>('UNKNOWN');
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [microphoneAvailable, setMicrophoneAvailable] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [permissionPending, setPermissionPending] = useState(false);
  const [permissionDialog, setPermissionDialog] = useState<'camera' | 'microphone' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinResult, setJoinResult] = useState<JoinResponse | null>(null);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const participantKey = useMemo(() => crypto.randomUUID(), []);
  const nameError = displayName.length > 0 && displayName.trim().length > 50 ? 'Name must be 50 characters or fewer.' : displayName.length > 0 && displayName.trim().length === 0 ? 'Enter a name to continue.' : '';
  const isReadyToJoin = displayName.trim().length > 0 && displayName.trim().length <= 50;
  const sessionId = import.meta.env.VITE_SESSION_ID ?? '';
  const accessToken = import.meta.env.VITE_SESSION_ACCESS_TOKEN ?? '';

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => () => stream?.getTracks().forEach((track) => track.stop()), [stream]);

  const requestPermissions = useCallback(async () => {
    if (permissionPending || role === 'VIEWER') return;
    setPermissionPending(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Media devices are unavailable.');
      const nextStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(nextStream);
      setCameraPermission('GRANTED');
      setMicrophonePermission('GRANTED');
      setCameraAvailable(true);
      setMicrophoneAvailable(true);
      setCameraEnabled(true);
      setMicrophoneEnabled(true);
      setPermissionDialog(null);
    } catch {
      setCameraPermission('DENIED');
      setMicrophonePermission('DENIED');
      setCameraEnabled(false);
      setMicrophoneEnabled(false);
      setPermissionDialog('camera');
    } finally {
      setPermissionPending(false);
    }
  }, [permissionPending, role]);

  const toggleDevice = (device: 'camera' | 'microphone') => {
    if (device === 'camera' && cameraPermission === 'GRANTED' && cameraAvailable) setCameraEnabled((enabled) => !enabled);
    if (device === 'microphone' && microphonePermission === 'GRANTED' && microphoneAvailable) setMicrophoneEnabled((enabled) => !enabled);
  };

  const submitJoin = useCallback(async () => {
    const trimmedName = displayName.trim();
    if (!trimmedName || trimmedName.length > 50 || joining) return;
    setJoinError('');
    if (!sessionId || !accessToken) {
      setJoinError('This session is not ready to accept joins.');
      return;
    }
    setJoining(true);
    try {
      const result = await joinSession(sessionId, accessToken, crypto.randomUUID(), {
        displayName: trimmedName,
        microphoneEnabled,
        cameraEnabled,
        microphoneDeviceId: null,
        cameraDeviceId: null,
        speakerDeviceId: null,
        virtualBackgroundId: null,
      });
      setJoinResult(result);
      setJoined(true);
    } catch (error: unknown) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        setJoinError(error.response?.data?.message ?? 'The session could not be joined.');
      } else {
        setJoinError('The session could not be joined. Check your connection and try again.');
      }
    } finally {
      setJoining(false);
    }
  }, [accessToken, cameraEnabled, displayName, joining, microphoneEnabled, sessionId]);

  const initialState = preparePreview({ participantKey, role, displayName, requestCamera: true, requestMicrophone: true });
  void initialState;

  return (
    <main className="min-h-screen overflow-auto bg-black px-6 py-10 text-[#eff0fa]">
      <section className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-10" aria-label="Pre-join preview">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-8 w-8 items-center justify-center text-[#538dff]" aria-label="Application logo">
            <span className="text-3xl font-semibold leading-none">✣</span>
          </div>
          <h1 className="text-[34px] font-semibold leading-10 tracking-[0.25px]">Get Started</h1>
          <p className="text-base leading-6 tracking-[0.5px] text-[#c5c6d0]">Setup your audio and video before joining</p>
        </div>

        <div className="rounded-[40px] border border-[#1d1f27] bg-[#191b23] px-4 py-2 text-sm font-semibold leading-5 tracking-[0.25px]">You are the first to join</div>

        <div className="flex w-full flex-col gap-6">
          <div className="relative h-[337.5px] w-full overflow-hidden rounded-2xl bg-[#11131a]">
            {cameraEnabled && stream ? <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#7e47eb] p-3"><Icon name="person" className="h-10 w-10" /></div></div>}
            <div className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full ${microphoneEnabled ? 'bg-[#293042]' : 'bg-[#004299]'}`} aria-label={microphoneEnabled ? 'Microphone on' : 'Microphone muted'}><Icon name="mic" className="h-4 w-4" /></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DeviceButton label={cameraEnabled ? 'Turn camera off' : 'Turn camera on'} active={cameraEnabled} disabled={permissionPending || cameraPermission !== 'GRANTED'} onClick={() => toggleDevice('camera')}><Icon name="camera" /></DeviceButton>
              <DeviceButton label={microphoneEnabled ? 'Mute microphone' : 'Unmute microphone'} active={microphoneEnabled} disabled={permissionPending || microphonePermission !== 'GRANTED'} onClick={() => toggleDevice('microphone')}><Icon name="mic" /></DeviceButton>
              <DeviceButton label="Request camera and microphone permission" active={false} disabled={permissionPending} onClick={() => void requestPermissions()}><Icon name="permission" /></DeviceButton>
            </div>
            <DeviceButton label="Open preview menu" active={menuOpen} disabled={false} onClick={() => setMenuOpen((open) => !open)}><Icon name="more" /></DeviceButton>
          </div>

          {menuOpen && <div className="relative self-end rounded-lg border border-[#272a31] bg-[#191b23] p-2 text-sm text-[#eff0fa] shadow-xl" role="menu"><button className="rounded px-3 py-2 hover:bg-[#2e3038]" role="menuitem" onClick={() => void requestPermissions()}>Request permissions</button><button className="block rounded px-3 py-2 hover:bg-[#2e3038]" role="menuitem" onClick={() => setMenuOpen(false)}>Close menu</button></div>}

          <div className="flex items-start gap-4">
            <div className="flex-1">
              <label htmlFor="display-name" className="sr-only">Display name</label>
              <input id="display-name" value={displayName} maxLength={60} onChange={(event) => setDisplayName(event.target.value)} placeholder="Enter name" aria-invalid={Boolean(nameError)} aria-describedby={nameError ? 'name-error' : undefined} className="h-12 w-full rounded-lg bg-[#191b23] px-4 py-3 text-base leading-6 tracking-[0.5px] text-[#eff0fa] outline-none placeholder:text-[#8f9099] focus:ring-2 focus:ring-[#538dff]" />
              {nameError && <p id="name-error" className="mt-2 text-sm text-[#ff9a9a]">{nameError}</p>}
            </div>
            <button type="button" disabled={!isReadyToJoin || joining} onClick={() => void submitJoin()} className="flex h-12 items-center gap-2 rounded-lg bg-[#004299] px-4 py-2 text-base font-semibold leading-6 tracking-[0.5px] text-[#84aaff] transition hover:bg-[#538dff] disabled:cursor-not-allowed disabled:opacity-70" aria-label="Join session"><Icon name="arrow" className="h-6 w-6" />{joining ? 'Joining…' : 'Go Live'}</button>
          </div>
          {joinError && <p role="alert" className="text-sm text-[#ff9a9a]">{joinError}</p>}
        </div>
      </section>

      {joined && <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-6" role="dialog" aria-modal="true" aria-label="Ready to join"><div className="w-full max-w-md rounded-2xl border border-[#272a31] bg-[#191b23] p-6"><div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold">Ready to join</h2><p className="mt-2 text-[#c5c6d0]">{joinResult ? `Joined as ${joinResult.participant.displayName}.` : 'Your preview is prepared locally.'}</p></div><button type="button" className="rounded p-1 hover:bg-[#2e3038]" aria-label="Close ready dialog" onClick={() => setJoined(false)}><Icon name="close" /></button></div></div></div>}

      {joined && joinResult && <button type="button" onClick={() => setParticipantsOpen(true)} className="fixed bottom-6 right-6 z-10 rounded-lg bg-[#538dff] px-4 py-3 text-base font-semibold text-black shadow-lg hover:bg-[#84aaff]">View participants</button>}
      {participantsOpen && joinResult && <div className="fixed inset-0 z-20 flex justify-end bg-black/60 p-6"><SessionParticipantsPanel sessionId={String(joinResult.session.id ?? sessionId)} accessToken={accessToken} onClose={() => setParticipantsOpen(false)} /></div>}

      {permissionDialog && <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-6" role="dialog" aria-modal="true" aria-label="Permission denied"><div className="w-full max-w-md rounded-2xl border border-[#272a31] bg-[#191b23] p-6"><div className="flex items-start justify-between"><div><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#293042] text-[#538dff]"><Icon name="permission" /></div><h2 className="text-xl font-semibold">Allow camera and microphone access</h2><p className="mt-2 text-[#c5c6d0]">{permissionText(permissionDialog === 'camera' ? cameraPermission : microphonePermission)}. Enable access in your browser settings, then try again.</p></div><button type="button" className="rounded p-1 hover:bg-[#2e3038]" aria-label="Close permission dialog" onClick={() => setPermissionDialog(null)}><Icon name="close" /></button></div><div className="mt-6 flex justify-end gap-3"><button type="button" className="rounded-lg border border-[#272a31] px-4 py-2 text-sm font-semibold hover:bg-[#2e3038]" onClick={() => setPermissionDialog(null)}>Continue muted</button><button type="button" className="rounded-lg bg-[#538dff] px-4 py-2 text-sm font-semibold text-black hover:bg-[#84aaff]" onClick={() => void requestPermissions()}>Try again</button></div></div></div>}
    </main>
  );
}

function DeviceButton({ label, active, disabled, onClick, children }: { label: string; active: boolean; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} aria-pressed={active} disabled={disabled} onClick={onClick} className={`flex h-12 items-center justify-center rounded-lg border px-2 transition focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:cursor-not-allowed disabled:opacity-50 ${active ? 'border-transparent bg-[#2e3038]' : 'border-[#272a31] text-[#c5c6d0] hover:bg-[#2e3038]'}`}>{children}</button>;
}
