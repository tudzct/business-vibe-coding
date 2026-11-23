import { useState } from 'react';
import axios from 'axios';
import { reactionCodes, sendReaction, type ReactionCode, type ReactionEvent } from '../api/reactions';

const reactionLabels: Record<ReactionCode, string> = { LIKE: '👍', CLAP: '👏', HEART: '❤️', CELEBRATE: '🎉', HAND: '✋', SURPRISE: '😮' };
const reactionNames: Record<ReactionCode, string> = { LIKE: 'Like', CLAP: 'Clap', HEART: 'Heart', CELEBRATE: 'Celebrate', HAND: 'Hand', SURPRISE: 'Surprise' };
type Props = { sessionId: string; accessToken: string; onReaction: (reaction: ReactionEvent) => void };
function CloseIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>; }

export default function ReactionPicker({ sessionId, accessToken, onReaction }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const choose = async (reaction: ReactionCode) => {
    if (sending) return;
    if (!sessionId.trim() || !accessToken.trim()) { setError('Choose a reaction.'); return; }
    setError(''); setSending(true);
    try { const result = await sendReaction(sessionId, accessToken, reaction); onReaction(result.reaction); setIsOpen(false); }
    catch (cause: unknown) { setError(axios.isAxiosError<{ message?: string }>(cause) ? cause.response?.data?.message ?? 'Reaction could not be sent.' : cause instanceof Error ? cause.message : 'Reaction could not be sent.'); }
    finally { setSending(false); }
  };
  return <div className="relative">
    <button type="button" aria-label="Open reactions" aria-expanded={isOpen} disabled={sending} onClick={() => { setError(''); setIsOpen((open) => !open); }} className="flex h-12 items-center justify-center rounded-lg border border-[#272a31] bg-[#191b23] px-3 text-2xl transition hover:bg-[#2e3038] focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:cursor-not-allowed disabled:opacity-50">😊</button>
    {isOpen && <div className="absolute bottom-14 left-1/2 z-30 w-[340px] -translate-x-1/2 rounded-2xl border border-[#1d1f27] bg-[#191b23] p-6 shadow-2xl" role="dialog" aria-label="Emoji Reactions">
      <div className="flex items-start justify-between gap-4"><div><h2 className="text-base font-semibold text-[#eff0fa]">Emoji Reactions</h2><p className="mt-1 text-sm text-[#c5c6d0]">Helps to send emoji reactions live within the session</p></div><button type="button" aria-label="Close reactions" disabled={sending} onClick={() => setIsOpen(false)} className="rounded-lg p-1 text-[#c5c6d0] hover:bg-[#2e3038] focus:outline-none focus:ring-2 focus:ring-[#538dff]"><CloseIcon /></button></div>
      <div className="mt-5 grid grid-cols-6 gap-2">{reactionCodes.map((reaction) => <button key={reaction} type="button" aria-label={`Send ${reactionNames[reaction]} reaction`} disabled={sending} onClick={() => void choose(reaction)} className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#272a31] bg-[#11131a] text-3xl transition hover:bg-[#2e3038] focus:outline-none focus:ring-2 focus:ring-[#538dff] disabled:cursor-not-allowed disabled:opacity-50">{reactionLabels[reaction]}</button>)}</div>
      {sending && <p className="mt-3 text-sm text-[#c5c6d0]" role="status">Sending reaction…</p>}
      {error && <p className="mt-3 rounded-lg bg-[#c74e5b] px-3 py-2 text-sm text-[#ffedec]" role="alert">{error}</p>}
    </div>}
  </div>;
}
