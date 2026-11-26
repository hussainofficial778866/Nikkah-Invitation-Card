/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { FrontInvitationCard } from './components/FrontInvitationCard';
import { OpenedInvitation } from './components/OpenedInvitation';
import { PetalOverlay } from './components/PetalOverlay';

const ARABIC_MUSIC_SRC = './assets/aistudio/Nikkah_Music__converted_by_happyscribe.com__c9b41f14.mp3';

type CardStage = 'closed' | 'opening' | 'opened';

export default function App() {
  const [stage, setStage] = useState<CardStage>('closed');
  const [revealKey, setRevealKey] = useState(1);
  const [petalBurstKey, setPetalBurstKey] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasAudioStarted, setHasAudioStarted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  // Prepare the uploaded Arabic wedding background track on mount
  useEffect(() => {
    const audio = new Audio(ARABIC_MUSIC_SRC);
    audio.preload = 'auto';
    audio.loop = true;
    audioRef.current = audio;

    const handleEnded = () => {
      // Fallback restart if loop is ever bypassed by a browser
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore if blocked before user gesture
      });
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      clearTimers();
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, [clearTimers]);

  // Keep audio element muted state synced
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const startMusicFromBeginning = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.muted = isMuted;
    try {
      await audio.play();
      setHasAudioStarted(true);
    } catch {
      // Playback will resume on next interaction if browser blocks
    }
  }, [isMuted]);

  const triggerOpeningSequence = useCallback(() => {
    clearTimers();
    setStage('opening');
    setPetalBurstKey((k) => k + 1);
    void startMusicFromBeginning();

    const openTimer = window.setTimeout(() => {
      setRevealKey((k) => k + 1);
      setStage('opened');
    }, 1050);

    timersRef.current.push(openTimer);
  }, [clearTimers, startMusicFromBeginning]);

  const handleOpenInvitation = () => {
    if (stage !== 'closed') return;
    triggerOpeningSequence();
  };

  const handleReplayInvitation = () => {
    clearTimers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStage('closed');
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }

    const replayTimer = window.setTimeout(() => {
      triggerOpeningSequence();
    }, 750);

    timersRef.current.push(replayTimer);
  };

  const handleDateScratched = useCallback(() => {
    setPetalBurstKey((k) => k + 1);
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
        if (!next && audioRef.current.paused && hasAudioStarted) {
          audioRef.current.play().catch(() => {});
        }
      }
      return next;
    });
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-x-hidden px-1 py-6 sm:px-4 sm:py-10">
      {/* Subtle atmospheric floral vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(135,198,236,0.22),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(229,154,164,0.16),transparent_60%)]"
      />

      {/* Discreet Music Control (Mute / Unmute) */}
      {hasAudioStarted && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
          title={isMuted ? 'Unmute music' : 'Mute music'}
          className="fixed top-4 right-4 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#84BCDF]/80 bg-[#FCF9F4]/90 text-[#2E628B] shadow-[0_6px_18px_rgba(44,96,136,0.18)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B7FAE]"
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-[#B84554]" /> : <Volume2 className="h-4 w-4" />}
        </button>
      )}

      {/* Floating Rose Petals Overlay */}
      <PetalOverlay burstKey={petalBurstKey} />

      {/* Main Invitation Stage */}
      <div className="relative z-10 w-full">
        {stage !== 'opened' ? (
          <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center">
            <FrontInvitationCard
              isOpening={stage === 'opening'}
              onOpen={handleOpenInvitation}
            />
          </div>
        ) : (
          <div className="animate-[fadeIn_700ms_ease-out_both]">
            <OpenedInvitation
              revealKey={revealKey}
              onDateScratched={handleDateScratched}
              onReplay={handleReplayInvitation}
            />
          </div>
        )}
      </div>
    </div>
  );
}
