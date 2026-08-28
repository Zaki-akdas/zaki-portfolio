'use client';
import {useState, useRef, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';

export default function IntroVideo({onComplete}: {onComplete: () => void}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(0); // 0–100
  const [showVolume, setShowVolume] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  // Handle video metadata loaded
  const handleLoadedMetadata = () => setVideoReady(true);

  // Preload poster image
  useEffect(() => {
    const img = new Image();
    img.src = '/intro-poster.svg';
    img.onload = () => setPosterLoaded(true);
    // Fallback: if SVG loads from cache
    img.onerror = () => setPosterLoaded(true);
  }, []);

  // Handle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
      setShowOverlay(false);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Handle video ended
  const handleEnded = () => {
    setIsPlaying(false);
    setShowOverlay(true);
    onComplete();
  };

  // Update progress bar
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };
    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, []);

  // Volume control
  const applyVolume = (v: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.min(100, Math.max(0, v));
    video.volume = clamped / 100;
    video.muted = clamped === 0;
    setVolume(clamped);
    setIsMuted(clamped === 0);
  };

  const toggleMute = () => {
    if (isMuted || volume === 0) {
      applyVolume(volume === 0 ? 50 : volume); // restore to 50% if fully muted
    } else {
      applyVolume(0);
    }
  };

  // Close volume popover on click outside
  useEffect(() => {
    if (!showVolume) return;
    const handler = (e: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        setShowVolume(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showVolume]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (isFullscreen) {
      if (document.exitFullscreen) document.exitFullscreen();
    } else {
      if (el.requestFullscreen) el.requestFullscreen();
    }
  };

  // Listen for fullscreen changes (including Escape key / browser UI)
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  return (
    <section ref={containerRef} className={`relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden bg-[#030014] ${isFullscreen ? 'rounded-none border-0' : 'rounded-xl sm:rounded-2xl lg:rounded-3xl border border-[#2A0E61]'}`}>
      {/* Poster / preview frame */}
      <div
        className={`absolute inset-0 z-[1] transition-opacity duration-700 ${posterLoaded && !isPlaying ? 'opacity-100' : 'opacity-0'}`}
      >
        <img
          src="/intro-poster.svg"
          alt="Intro video preview"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Loading shimmer while video loads */}
      {!videoReady && !isPlaying && (
        <div className="absolute inset-0 z-[2] bg-[#030014] overflow-hidden">
          <div className="absolute inset-0 shimmer-bg" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#7042f8]/30 border-t-[#7042f8] animate-spin" />
            <p className="mt-4 text-gray-500 text-xs sm:text-sm tracking-widest uppercase">Loading video…</p>
          </div>
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        src="/intro.mp4"
        className="absolute inset-0 w-full h-full object-cover"
        loop={false}
        playsInline
        preload="metadata"
        muted={isMuted}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        poster="/intro-poster.svg"
      />

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/40 to-transparent pointer-events-none z-[3]" />

      {/* Initial overlay with play button */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.5}}
            className="absolute inset-0 z-[4] flex flex-col items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            {/* Decorative glow behind play button */}
            <div className="absolute w-[200px] sm:w-[280px] lg:w-[350px] h-[200px] sm:h-[280px] lg:h-[350px] rounded-full bg-[radial-gradient(circle,rgba(112,66,248,0.25),transparent_70%)] blur-[60px] pointer-events-none" />

            {/* Play button */}
            <motion.div
              initial={{scale: 0.8, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              exit={{scale: 1.2, opacity: 0}}
              transition={{duration: 0.4, ease: [0.16, 1, 0.3, 1]}}
              className="relative z-[3] flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 border-[#7042f8]/60 bg-[#7042f8]/20 backdrop-blur-md hover:bg-[#7042f8]/40 hover:border-[#7042f8] transition-all duration-300 group"
            >
              {/* Play icon */}
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white ml-1 group-hover:scale-110 transition-transform"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </motion.div>

            {/* Text below play button */}
            <motion.div
              initial={{y: 20, opacity: 0}}
              animate={{y: 0, opacity: 1}}
              exit={{y: -10, opacity: 0}}
              transition={{delay: 0.2, duration: 0.5}}
              className="mt-5 sm:mt-6 text-center z-[3]"
            >
              <p className="text-white text-sm sm:text-base md:text-lg font-semibold tracking-wide">
                Watch My Intro
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Click to play • {videoReady ? 'Ready' : 'Buffering…'}
              </p>
            </motion.div>

            {/* Gesture hint — pulsing tap icon */}
            <motion.div
              initial={{opacity: 0, y: 10}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -5}}
              transition={{delay: 1.2, duration: 0.6}}
              className="relative mt-6 sm:mt-8 z-[3] flex flex-col items-center gap-2"
              aria-hidden="true"
            >
              {/* Expanding ring pulse */}
              <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14">
                {/* Outer pulse ring */}
                <div className="absolute inset-0 rounded-full border border-[#7042f8]/40 gesture-ring" />
                {/* Inner pulse ring */}
                <div className="absolute inset-1.5 rounded-full border border-[#b49bff]/25 gesture-ring-delayed" />

                {/* Tap / hand icon */}
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#b49bff] gesture-bob" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                </svg>
              </div>

              {/* Swipe / scroll hint text */}
              <motion.p
                initial={{opacity: 0}}
                animate={{opacity: 0.5}}
                transition={{delay: 1.8, duration: 0.8}}
                className="text-[10px] sm:text-xs text-gray-500 tracking-widest uppercase"
              >
                Tap to play
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls bar — only visible while playing */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 20}}
            transition={{duration: 0.3}}
            className="absolute bottom-0 left-0 right-0 z-[4] px-3 sm:px-5 pb-3 sm:pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div className="w-full h-[2px] sm:h-[3px] bg-white/10 rounded-full overflow-hidden mb-2 sm:mb-3">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(to right, #7042f8, #06b6d4)',
                  boxShadow: '0 0 8px rgba(112,66,248,0.5)',
                }}
              />
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              {/* Left: Play/Pause + Volume */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white cursor-pointer"
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Volume control group */}
                <div ref={volumeRef} className="relative flex items-center">
                  {/* Volume button */}
                  <button
                    onClick={toggleMute}
                    onDoubleClick={(e) => { e.stopPropagation(); setShowVolume(v => !v); }}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white cursor-pointer"
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    title="Click to mute/unmute • Double-click for volume"
                  >
                    {isMuted || volume === 0 ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                      </svg>
                    ) : volume < 50 ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                    )}
                  </button>

                  {/* Volume slider popover */}
                  <AnimatePresence>
                    {showVolume && (
                      <motion.div
                        initial={{opacity: 0, y: 10, scale: 0.9}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: 10, scale: 0.9}}
                        transition={{duration: 0.2, ease: [0.16, 1, 0.3, 1]}}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center gap-2 p-2.5 rounded-xl bg-[#0a0520]/95 backdrop-blur-md border border-[#2A0E61] shadow-lg shadow-black/40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Percentage label */}
                        <span className="text-[10px] text-gray-400 font-mono tabular-nums w-full text-center">
                          {volume}%
                        </span>

                        {/* Vertical slider track */}
                        <div
                          className="relative w-1.5 h-24 sm:h-28 rounded-full bg-white/10 cursor-pointer"
                          onMouseDown={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pct = Math.round(((rect.bottom - e.clientY) / rect.height) * 100);
                            applyVolume(pct);

                            const onMove = (ev: MouseEvent) => {
                              const p = Math.round(((rect.bottom - ev.clientY) / rect.height) * 100);
                              applyVolume(p);
                            };
                            const onUp = () => {
                              document.removeEventListener('mousemove', onMove);
                              document.removeEventListener('mouseup', onUp);
                            };
                            document.addEventListener('mousemove', onMove);
                            document.addEventListener('mouseup', onUp);
                          }}
                          onTouchStart={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const touch = e.touches[0];
                            const pct = Math.round(((rect.bottom - touch.clientY) / rect.height) * 100);
                            applyVolume(pct);

                            const onMove = (ev: TouchEvent) => {
                              const t = ev.touches[0];
                              const p = Math.round(((rect.bottom - t.clientY) / rect.height) * 100);
                              applyVolume(p);
                            };
                            const onEnd = () => {
                              document.removeEventListener('touchmove', onMove);
                              document.removeEventListener('touchend', onEnd);
                            };
                            document.addEventListener('touchmove', onMove, {passive: true});
                            document.addEventListener('touchend', onEnd);
                          }}
                        >
                          {/* Filled portion */}
                          <div
                            className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-75"
                            style={{
                              height: `${volume}%`,
                              background: 'linear-gradient(to top, #7042f8, #06b6d4)',
                              boxShadow: '0 0 6px rgba(112,66,248,0.4)',
                            }}
                          />
                          {/* Thumb */}
                          <div
                            className="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#7042f8] shadow-md shadow-[#7042f8]/40 transition-all duration-75 pointer-events-none"
                            style={{bottom: `calc(${volume}% - 7px)`}}
                          />
                        </div>

                        {/* Quick presets */}
                        <div className="flex gap-1.5">
                          {[0, 25, 50, 75, 100].map(v => (
                            <button
                              key={v}
                              onClick={() => applyVolume(v)}
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition cursor-pointer ${volume === v ? 'bg-[#7042f8] text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                              aria-label={`Set volume to ${v}%`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right: Fullscreen + Skip */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={toggleFullscreen}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white cursor-pointer"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={onComplete}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#7042f8]/30 hover:bg-[#7042f8]/50 border border-[#7042f8]/50 text-white text-xs sm:text-sm font-medium transition cursor-pointer"
                  aria-label="Skip intro"
                >
                  Skip Intro →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-play after 3 seconds if user hasn't interacted */}
      <AutoPlayTimer videoRef={videoRef} isPlaying={isPlaying} onPlay={() => {
        videoRef.current?.play().catch(() => {});
        setIsPlaying(true);
        setShowOverlay(false);
      }} />
    </section>
  );
}

/* ─── Auto-play timer that cancels on user interaction ─── */
function AutoPlayTimer({
  videoRef,
  isPlaying,
  onPlay,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  useEffect(() => {
    if (isPlaying) return;
    const video = videoRef.current;
    if (!video) return;

    // Try to autoplay (muted, so browsers allow it)
    const tryAutoplay = async () => {
      try {
        video.muted = true;
        await video.play();
        onPlay();
      } catch {
        // Autoplay blocked — user must click
      }
    };

    const timer = setTimeout(tryAutoplay, 1500);
    return () => clearTimeout(timer);
  }, [isPlaying, videoRef, onPlay]);

  return null;
}
