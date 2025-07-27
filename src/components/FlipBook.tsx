import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import HTMLFlipBook from 'react-pageflip';

interface FlipBookProps {
  pages: string[];
  backgroundMusic?: string;
  youtubeUrl?: string;
  title: string;
}

export const FlipBook: React.FC<FlipBookProps> = ({
  pages,
  backgroundMusic,
  youtubeUrl,
  title
}) => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.2);
  const [currentPage, setCurrentPage] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const flipBookRef = useRef<any>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') flipBookRef.current.pageFlip().flipPrev();
      if (e.key === 'ArrowRight') flipBookRef.current.pageFlip().flipNext();
      if (e.key === ' ') togglePlayPause();
      if (e.key === 'm' || e.key === 'M') toggleMute();
      if (e.key === '+') zoomIn();
      if (e.key === '-') zoomOut();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error('Playback failed:', e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.7));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  const handlePageChange = (e: { data: number }) => {
    setCurrentPage(e.data);
    
    // Play page turning sound
    const flipSound = new Audio('/book-opening-345808.mp3');
    flipSound.play().catch(e => console.error('Failed to play flip sound:', e));
  };

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = youtubeUrl ? getYouTubeId(youtubeUrl) : null;

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900">
      {/* Background Music */}
      {backgroundMusic && (
        <audio 
          ref={audioRef}
          src={backgroundMusic}
          loop
          muted={isMuted}
          className="hidden"
        />
      )}

      {/* YouTube Video Background */}
      {videoId && (
        <div className="fixed inset-0 z-0">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&loop=1&mute=${isMuted ? 1 : 0}&playlist=${videoId}`}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Background Video"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Flip Book Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-6xl h-full flex items-center justify-center">
          <button
            onClick={() => flipBookRef.current.pageFlip().flipPrev()}
            disabled={currentPage === 0}
            className={`p-3 rounded-full ${currentPage === 0 ? 'text-gray-500' : 'text-white hover:bg-white/10'}`}
            aria-label={t('Previous page', 'ໜ້າກ່ອນໜ້າ')}
          >
            <ChevronLeft size={32} />
          </button>

          <div className="flex-1 flex justify-center items-center h-full">
            <div 
              className="relative shadow-2xl"
              style={{ 
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.3s ease',
                transformOrigin: 'center'
              }}
            >
              {/* Page turning sound effect */}
              <audio src="/book-opening-345808.mp3" />
              <HTMLFlipBook
                ref={flipBookRef}
                width={550}
                height={733}
                size="stretch"
                minWidth={300}
                maxWidth={1000}
                minHeight={400}
                maxHeight={1200}
                drawShadow={true}
                flippingTime={500}
                usePortrait={true}
                startZIndex={0}
                autoSize={false}
                showPageCorners={true}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                onFlip={handlePageChange}
                className="flip-book"
                style={{}}
                startPage={0}
                disableFlipByClick={false}
                useMouseEvents={true}
                swipeDistance={10}
                clickEventForward={false}
                onInit={(flip) => console.log('Flipbook initialized', flip)}
              >
                {pages.map((page, index) => (
                  <div key={index} className="demoPage">
                    <img
                      src={page}
                      alt={`${title} - ${t('Page', 'ໜ້າ')} ${index + 1}`}
                      className="w-full h-full object-contain bg-white"
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            </div>
          </div>

          <button
            onClick={() => flipBookRef.current.pageFlip().flipNext()}
            disabled={currentPage === pages.length - 1}
            className={`p-3 rounded-full ${currentPage === pages.length - 1 ? 'text-gray-500' : 'text-white hover:bg-white/10'}`}
            aria-label={t('Next page', 'ໜ້າຕໍ່ໄປ')}
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center space-x-6 p-4 bg-black/50 z-10">
        <button
          onClick={toggleMute}
          className="text-white p-2 rounded-full hover:bg-white/10"
          aria-label={isMuted ? t('Unmute', 'ເປີດສຽງ') : t('Mute', 'ປິດສຽງ')}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>

        <button
          onClick={togglePlayPause}
          className={`px-6 py-2 rounded-lg ${isPlaying ? 'bg-red-500' : 'bg-green-500'} text-white`}
        >
          {isPlaying ? t('Pause', 'ຢຸດຊົ່ວຄາວ') : t('Play', 'ຫລີ້ນ')}
        </button>

        <div className="flex space-x-2">
          <button
            onClick={zoomOut}
            className="text-white p-2 rounded-full hover:bg-white/10"
            title={t('Zoom Out', 'ຫຍໍ້')}
          >
            <ZoomOut size={20} />
          </button>
          
          <button
            onClick={resetZoom}
            className="text-white p-2 rounded-full hover:bg-white/10"
            title={t('Reset Zoom', 'ຕັ້ງຄ່າໃໝ່')}
          >
            <RotateCcw size={20} />
          </button>
          
          <button
            onClick={zoomIn}
            className="text-white p-2 rounded-full hover:bg-white/10"
            title={t('Zoom In', 'ຂະຫຍາຍ')}
          >
            <ZoomIn size={20} />
          </button>
        </div>

        <div className="text-white">
          {currentPage + 1} / {pages.length}
        </div>
      </div>
    </div>
  );
};

// Add custom styles for the flipbook
const style = document.createElement('style');
style.innerHTML = `
  .flip-book .page {
    background-color: white;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center center;
  }
  
  .flip-book .shadow,
  .flip-book .page-shadow {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  }
  
  .flip-book .page-wrapper {
    perspective: 2000px;
  }
`;
document.head.appendChild(style);
