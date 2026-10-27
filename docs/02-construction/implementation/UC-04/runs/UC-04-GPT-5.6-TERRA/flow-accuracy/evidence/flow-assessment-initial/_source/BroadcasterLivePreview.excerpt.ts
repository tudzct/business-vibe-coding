// BroadcasterLivePreview.tsx Lines 64-83
  const stop = async (): Promise<void> => {
    if (!uuidPattern.test(sessionId)) { setMessage('A valid session is required to end a live stream.'); return; }
    if (!accessToken) { setMessage('An authenticated access context is required to end a live stream.'); return; }
    const expectedVersion = state?.stream?.version;
    if (typeof expectedVersion !== 'number' || !Number.isInteger(expectedVersion)) { setMessage('The current stream version is unavailable. Refresh the session and try again.'); return; }
    if (state?.stream?.status !== 'LIVE' && state?.stream?.status !== 'STARTING') { setMessage('The live stream cannot be ended in its current state.'); return; }
    setMessage(null);
    setIsStopping(true);
    stopIdempotencyKey.current ??= crypto.randomUUID();
    try {
      const command = await stopLiveStream(sessionId, accessToken, stopIdempotencyKey.current, expectedVersion);
      setState((current) => current ? { ...current, stream: command.stream, session: command.session } : current);
      setState(await getSessionState(sessionId, accessToken));
      setIsStopConfirmationOpen(false);
      stopIdempotencyKey.current = null;
    } catch (error: unknown) {
      setMessage(error instanceof SessionApiError ? error.message : 'A technical failure prevented the live stream from ending.');
      if (error instanceof SessionApiError && error.message.toLowerCase().includes('version')) await refreshAfterVersionConflict();
    } finally { setIsStopping(false); }
  };
