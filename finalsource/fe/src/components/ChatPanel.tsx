import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { listChatMessages, sendChatMessage, type ChatMessage } from '../api/chatMessages';

type Props = { sessionId: string; accessToken: string; onClose: () => void };
const formatTime = (value: string) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));

function CloseIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>; }
function SendIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 4 16 8-16 8 3-8-3-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M7 12h13" stroke="currentColor" strokeWidth="1.8" /></svg>; }

export default function ChatPanel({ sessionId, accessToken, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true); setError('');
    try { const page = await listChatMessages(sessionId, accessToken, undefined, controller.signal); setMessages(page.items); }
    catch (cause: unknown) { if (!axios.isCancel(cause)) setError(axios.isAxiosError<{ message?: string }>(cause) ? cause.response?.data?.message ?? 'Chat history could not be loaded.' : cause instanceof Error ? cause.message : 'Chat history could not be loaded.'); }
    finally { setLoading(false); }
    return () => controller.abort();
  }, [accessToken, sessionId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }); }, [messages]);

  const send = async () => {
    const body = draft.trim();
    if (!body) { setValidationError('Enter a message.'); return; }
    if (body.length > 1000) { setValidationError('Message must be 1000 characters or fewer.'); return; }
    if (sending) return;
    setValidationError(''); setError(''); setSending(true);
    try { const result = await sendChatMessage(sessionId, accessToken, body); setMessages((current) => current.some((message) => message.id === result.message.id) ? current : [...current, result.message]); setDraft(''); }
    catch (cause: unknown) { setError(axios.isAxiosError<{ message?: string }>(cause) ? cause.response?.data?.message ?? 'Chat message could not be sent.' : cause instanceof Error ? cause.message : 'Chat message could not be sent.'); }
    finally { setSending(false); }
  };

  return <aside className="flex h-[790px] w-[400px] max-w-full flex-col gap-4 overflow-hidden rounded-2xl bg-[#11131a] p-6 text-[#eff0fa]" aria-label="Chat panel">
    <header className="flex items-center justify-between"><div className="flex rounded-lg bg-[#191b23] p-1 text-sm font-semibold"><span className="rounded bg-[#272a31] px-3 py-2">Chat</span><span className="px-3 py-2 text-[#8f9099]">Participants</span></div><button type="button" onClick={onClose} className="rounded-lg p-1 text-[#c5c6d0] hover:bg-[#272a31] focus:outline-none focus:ring-2 focus:ring-[#538dff]" aria-label="Close"><CloseIcon /></button></header>
    {loading && messages.length === 0 && <p className="text-sm text-[#c5c6d0]" role="status">Loading chat…</p>}
    {error && <div className="rounded-lg bg-[#191b23] p-3 text-sm text-[#ffb4ab]" role="alert">{error}<button type="button" className="ml-2 underline" onClick={() => void load()}>Retry</button></div>}
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto" aria-live="polite">{messages.map((message) => <article key={message.id} className="rounded-lg p-2 hover:bg-[#191b23]"><div className="flex items-center justify-between gap-2"><strong className="text-sm leading-5">{message.senderParticipantId}</strong><time className="text-xs text-[#c5c6d0]">{formatTime(message.sentAt)}</time></div><p className="mt-1 break-words text-sm leading-5">{message.body}</p></article>)}<div ref={endRef} /></div>
    <div className="space-y-2"><div className="flex items-end gap-2 rounded-lg bg-[#191b23] p-2"><label htmlFor="chat-message" className="sr-only">Message</label><textarea id="chat-message" value={draft} maxLength={1000} rows={2} onChange={(event) => { setDraft(event.target.value); setValidationError(''); }} placeholder="Send a message" className="min-h-10 flex-1 resize-none bg-transparent text-sm leading-5 outline-none placeholder:text-[#8f9099]" aria-invalid={Boolean(validationError)} aria-describedby={validationError ? 'chat-message-error' : undefined} /><button type="button" onClick={() => void send()} disabled={sending} className="rounded-lg bg-[#538dff] p-2 text-black disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send message"><SendIcon /></button></div>{validationError && <p id="chat-message-error" className="text-sm text-[#ffb4ab]" role="alert">{validationError}</p>}</div>
  </aside>;
}
