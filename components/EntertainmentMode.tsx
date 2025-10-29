
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { YOUTUBE_SHORT_IDS } from '../constants';

interface EntertainmentModeProps {
  onExit: () => void;
}

const EntertainmentMode: React.FC<EntertainmentModeProps> = ({ onExit }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const videoId = YOUTUBE_SHORT_IDS[currentVideoIndex];
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'ArrowDown') {
        event.preventDefault();
        setCurrentVideoIndex((prev) => (prev + 1) % YOUTUBE_SHORT_IDS.length);
        setIsPlaying(true);
      } else if (event.code === 'Space') {
        event.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (event.code === 'Escape') {
        event.preventDefault();
        onExit();
      }
      setShowControls(true);
      if(controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = window.setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
       if(controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [onExit]);

  useEffect(() => {
    const player = iframeRef.current?.contentWindow;
    if (player) {
      const command = isPlaying ? 'playVideo' : 'pauseVideo';
      player.postMessage(`{"event":"command","func":"${command}","args":""}`, '*');
    }
  }, [isPlaying, currentVideoIndex]);

  useEffect(() => {
    const timeout = setTimeout(() => setShowControls(false), 3000);
    controlsTimeoutRef.current = timeout;
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in">
      <div className="relative w-full max-w-[360px] h-full max-h-[640px] aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-2xl shadow-accent-purple/30">
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=0&enablejsapi=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>

        <div className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
            <p className="text-white text-2xl font-bold bg-black/50 px-4 py-2 rounded-lg">Paused</p>
        </div>

        <button 
          onClick={onExit}
          className={`absolute top-4 right-4 p-3 bg-black/50 rounded-full text-white hover:bg-red-500/80 transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
          aria-label="Exit entertainment mode"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default EntertainmentMode;
