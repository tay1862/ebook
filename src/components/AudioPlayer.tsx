import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

interface AudioPlayerProps {
  audioUrl?: string
  autoPlay?: boolean
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (autoPlay && audioUrl) {
      setIsPlaying(true)
    }
  }, [audioUrl, autoPlay])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  if (!audioUrl) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-full shadow-lg p-3 flex items-center space-x-3 z-50">
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      
      <button
        onClick={togglePlay}
        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleMute}
          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      <span className="text-xs text-gray-500">
        {t('Background Music', 'ດົນຕີ')}
      </span>
    </div>
  )
}