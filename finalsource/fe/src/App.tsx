import PreJoinPreview from './components/PreJoinPreview';
import ChatPanel from './components/ChatPanel';

export default function App() {
  const sessionId = import.meta.env.VITE_SESSION_ID ?? '';
  const accessToken = import.meta.env.VITE_SESSION_ACCESS_TOKEN ?? '';
  return <><PreJoinPreview />{sessionId && accessToken && <div className="fixed inset-y-24 right-6 z-10"><ChatPanel sessionId={sessionId} accessToken={accessToken} onClose={() => undefined} /></div>}</>;
}
