export function LiveStreamViewer({ sessionId: propSessionId, accessToken: propAccessToken }: LiveStreamViewerProps = {}) {
  const sessionId = propSessionId || new URLSearchParams(window.location.search).get('sessionId') || window.sessionStorage.getItem('activeSessionId') || '';
  const accessToken = propAccessToken || window.sessionStorage.getItem('sessionAccessToken') || '';
  const [viewerView, setViewerView] = useState<LiveStreamViewData | null>(null);
  const [sessionState, setSessionState] = useState<SessionStateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(75);

  const isValidContext = uuidPattern.test(sessionId) && accessToken.trim().length > 0;
  const controlsDisabled = isLoading || !viewerView || Boolean(errorMessage);
  const participantLabel = useMemo(() => sessionState?.selfParticipant.displayName ?? 'Viewer', [sessionState]);

  useEffect(() => {
    const controller = new AbortController();
    if (!isValidContext) {
      setViewerView(null);
      setSessionState(null);
      setErrorMessage(!uuidPattern.test(sessionId) ? 'A valid live session is required to watch this stream.' : 'An authenticated access context is required to watch this stream.');
      setIsLoading(false);
      return () => controller.abort();
    }

    setIsLoading(true);
    setErrorMessage(null);
    void Promise.all([
      getLiveStreamView(sessionId, accessToken, controller.signal),
      getSessionState(sessionId, accessToken, controller.signal),
    ])
      .then(([nextViewerView, nextSessionState]) => {
        if (!controller.signal.aborted) {
          setViewerView(nextViewerView);
          setSessionState(nextSessionState);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setViewerView(null);
          setSessionState(null);
          setErrorMessage(error instanceof SessionApiError ? error.message : 'The live session could not be loaded. Please try again.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [accessToken, isValidContext, sessionId]);
