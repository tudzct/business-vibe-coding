import { useEffect, useState } from 'react';
import { PreJoinPreview } from './components/PreJoinPreview';
import { BroadcasterLivePreview } from './components/BroadcasterLivePreview';
import type { JoinSessionData } from './api/session';

export default function App() {
  const [currentView, setCurrentView] = useState<'preview' | 'broadcaster'>('preview');
  const [sessionContext, setSessionContext] = useState<{ sessionId: string; token: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'broadcaster' || window.location.pathname.startsWith('/broadcaster')) {
      setCurrentView('broadcaster');
    }
  }, []);

  const handleJoinSuccess = (joinedData: JoinSessionData, sessionId: string, accessToken: string) => {
    setSessionContext({ sessionId, token: accessToken });
    if (joinedData.session.kind === 'LIVE_STREAM' && joinedData.participant.role === 'HOST') {
      setCurrentView('broadcaster');
    }
  };

  if (currentView === 'broadcaster') {
    return (
      <BroadcasterLivePreview
        sessionId={sessionContext?.sessionId}
        accessToken={sessionContext?.token}
      />
    );
  }

  return (
    <PreJoinPreview
      onJoinSuccess={handleJoinSuccess}
      onGoToBroadcaster={() => setCurrentView('broadcaster')}
    />
  );
}
