import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { listParticipants, type Participant } from '../api/participants';

type Props = { sessionId: string; accessToken: string; onClose: () => void };

function PeopleIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M3.5 20c.6-3.4 2.5-5 5.5-5s4.9 1.6 5.5 5M15 5.5a3 3 0 0 1 0 5.8M16 15c2.6.2 4.1 1.8 4.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

function CloseIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 4.90237 4.90237 5.29289 5.29289 5.29289C4.90237 5.29289 5.29289 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C5.68342 19.0976 6.31658 19.0976 6.70711 18.7071C7.09763 19.0976 7.68342 19.0976 8.07394 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071C19.0976 19.0976 19.0976 19.3166 18.7071 19.7071L13.4142 12L18.7071 6.70711Z" fill="#C5C6D0" /></svg>;
}

export default function SessionParticipantsPanel({ sessionId, accessToken, onClose }: Props) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadingCursor = useRef<string | undefined>(undefined);

  const load = useCallback(async (cursor?: string) => {
    if (loadingCursor.current === cursor) return;
    loadingCursor.current = cursor;
    setLoading(true);
    setError('');
    const controller = new AbortController();
    try {
      const page = await listParticipants(sessionId, accessToken, cursor, controller.signal);
      setParticipants((current) => {
        const merged = cursor ? [...current, ...page.items] : page.items;
        return Array.from(new Map(merged.map((participant) => [participant.id, participant])).values());
      });
      setNextCursor(page.nextCursor);
    } catch (cause: unknown) {
      if (!axios.isCancel(cause)) setError(axios.isAxiosError<{ message?: string }>(cause) ? cause.response?.data?.message ?? 'Participant list unavailable.' : cause instanceof Error ? cause.message : 'Participant list unavailable.');
    } finally {
      loadingCursor.current = undefined;
      setLoading(false);
    }
    return () => controller.abort();
  }, [accessToken, sessionId]);

  useEffect(() => { void load(); }, [load]);

  return <aside className="flex h-[790px] w-[400px] max-w-full flex-col gap-4 overflow-hidden rounded-2xl bg-[#11131a] px-6 pb-4 pt-6 text-[#eff0fa]" aria-label="Participants panel">
    <header className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2"><PeopleIcon /><h2 className="text-base font-semibold leading-6 tracking-[0.5px]">Participants</h2></div>
      <button type="button" onClick={onClose} className="rounded-lg p-1 text-[#c5c6d0] hover:bg-[#272a31] focus:outline-none focus:ring-2 focus:ring-[#538dff]" aria-label="Close participants panel"><CloseIcon /></button>
    </header>
    <div className="h-px w-full bg-[#272a31]" />
    <div className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
      {loading && participants.length === 0 && <p className="py-6 text-sm text-[#c5c6d0]">Loading participants…</p>}
      {!loading && !error && participants.length === 0 && <p className="py-6 text-sm text-[#c5c6d0]">No participants yet.</p>}
      {error && <div className="rounded-lg bg-[#191b23] p-3 text-sm text-[#ffb4ab]" role="alert">{error}</div>}
      <ul className="flex flex-col gap-4">
        {participants.map((participant) => <li key={participant.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-[#191b23]"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7e47eb] text-sm font-semibold">{participant.displayName.slice(0, 2).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold leading-5">{participant.displayName}</p><p className="text-xs leading-4 tracking-[0.4px] text-[#c5c6d0]">{participant.role.replace('_', ' ')}</p></div></li>)}
      </ul>
      {nextCursor && <button type="button" onClick={() => void load(nextCursor)} disabled={loading} className="mt-4 w-full rounded-lg border border-[#272a31] px-3 py-2 text-sm font-semibold hover:bg-[#272a31] disabled:opacity-50">{loading ? 'Loading…' : 'Load more'}</button>}
    </div>
  </aside>;
}
