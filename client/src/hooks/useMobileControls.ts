'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

const CONTROLS_HIDE_DELAY = 4000;

export function useMobileControls() {
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [infoTab, setInfoTab] = useState<'info' | 'episodes'>('episodes');
  const [showComments, setShowComments] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetControlsTimer = useCallback(() => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    setControlsVisible(true);
    controlsTimer.current = setTimeout(() => {
      setControlsVisible(false);
    }, CONTROLS_HIDE_DELAY);
  }, []);

  // Pause auto-hide when overlays are open
  useEffect(() => {
    if (showInfoPanel || showComments) {
      setControlsVisible(true);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    } else {
      resetControlsTimer();
    }
  }, [showInfoPanel, showComments, resetControlsTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  const handleSingleTap = useCallback(() => {
    if (controlsVisible) {
      setControlsVisible(false);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    } else {
      resetControlsTimer();
    }
  }, [controlsVisible, resetControlsTimer]);

  const openInfoPanel = useCallback((tab: 'info' | 'episodes') => {
    setShowInfoPanel(true);
    setInfoTab(tab);
  }, []);

  return {
    controlsVisible,
    handleSingleTap,
    showInfoPanel,
    setShowInfoPanel,
    infoTab,
    openInfoPanel,
    showComments,
    setShowComments,
  };
}
