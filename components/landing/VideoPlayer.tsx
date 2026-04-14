import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
    url: string;
    poster: string;
}

const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, poster }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const youtubeId = getYouTubeId(url);

    const togglePlay = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (youtubeId) {
            handleExpand(); // YouTube videos must play in expanded mode for best experience
            return;
        }

        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleExpand = () => {
        setIsExpanded(true);
        if (videoRef.current) videoRef.current.pause(); // Pause preview if expanding
        setIsPlaying(false);
    };

    return (
        <>
            <div
                className="relative w-full h-full group cursor-pointer bg-black"
                onClick={handleExpand}
            >
                {/* Preview Video / Image */}
                <div className="absolute inset-0">
                    <img src={poster} alt="Video Cover" className={cn("w-full h-full object-cover transition-opacity duration-300", isPlaying ? "opacity-0" : "opacity-100")} />

                    {!youtubeId && (
                        <video
                            ref={videoRef}
                            src={url}
                            className={cn("w-full h-full object-cover", !isPlaying && "hidden")}
                            playsInline
                            muted // Muted in preview? User didn't specify, but safer for autoplay policies if we were autoplaying. Here we manual play.
                            onEnded={() => setIsPlaying(false)}
                            onPause={() => setIsPlaying(false)}
                            onPlay={() => setIsPlaying(true)}
                        />
                    )}
                </div>

                {/* Controls Overlay */}
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/20 transition-all duration-300",
                    isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                )}>
                    <button
                        onClick={togglePlay}
                        className="w-16 h-16 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-xl"
                    >
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                    </button>

                    {!isPlaying && (
                        <div className="absolute bottom-6 left-0 right-0 text-center">
                            <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-black drop-shadow-md">
                                Ver em Tela Cheia
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-8"
                        onClick={() => setIsExpanded(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm md:max-w-md aspect-[9/16] bg-black rounded-[40px] overflow-hidden shadow-2xl border border-neutral-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {youtubeId ? (
                                <iframe
                                    className="w-full h-full object-cover"
                                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&loop=0&controls=1&showinfo=0&rel=0&modestbranding=1`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <video
                                    src={url}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    controls
                                    playsInline
                                    poster={poster}
                                />
                            )}
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="absolute top-6 right-6 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
