import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { EBook } from '../types'
import { FlipBook } from '../components/FlipBook'
import { AudioPlayer } from '../components/AudioPlayer'
import { QRCodeDisplay } from '../components/QRCodeDisplay'
import { useLanguage } from '../contexts/LanguageContext'

interface ViewPageProps {
  ebookId: string
}

export const ViewPage: React.FC<ViewPageProps> = ({ ebookId }) => {
  const [ebook, setEbook] = useState<EBook | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { language, t } = useLanguage()

  useEffect(() => {
    if (ebookId) {
      fetchEbook()
      incrementViewCount()
    }
  }, [ebookId])

  const fetchEbook = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('id', ebookId)
        .eq('is_public', true)
        .single()

      if (error) {
        setError(t('eBook not found', 'ບໍ່ພົບປຶ້ມ'))
        return
      }

      setEbook(data)
    } catch (error) {
      console.error('Error fetching ebook:', error)
      setError(t('Failed to load eBook', 'ໂຫລດປຶ້ມບໍ່ສໍາເລັດ'))
    } finally {
      setIsLoading(false)
    }
  }

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_view_count', { ebook_id: ebookId })
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-white">{t('Loading eBook...', 'ກໍາລັງໂຫລດປຶ້ມ...')}</p>
        </div>
      </div>
    )
  }

  if (error || !ebook) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 max-w-md">
            <h2 className="text-xl font-bold text-red-400 mb-2">
              {t('Error', 'ຜິດພາດ')}
            </h2>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {t('Go Back', 'ກັບຄືນ')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const title = language === 'lo' ? ebook.title_lo : ebook.title

  return (
    <div className="relative">
      {/* Navigation Header */}
      <div className="absolute top-4 left-4 z-50 flex space-x-2">
        <button
          onClick={() => navigate('/')}
          className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setShowQR(true)}
          className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all"
        >
          <Share2 className="w-5 h-5" />
        </button>
        
        <div className="bg-black/50 text-white px-3 py-3 rounded-full backdrop-blur-sm flex items-center space-x-2">
          <Eye className="w-4 h-4" />
          <span className="text-sm">{ebook.view_count}</span>
        </div>
      </div>

      <FlipBook
        pages={ebook.pages}
        title={title}
        backgroundMusic={ebook.background_music}
        youtubeUrl={ebook.youtube_url}
      />

      {ebook.background_music && (
        <AudioPlayer audioUrl={ebook.background_music} autoPlay />
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <QRCodeDisplay
              url={window.location.href}
              title={title}
            />
            <button
              onClick={() => setShowQR(false)}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
