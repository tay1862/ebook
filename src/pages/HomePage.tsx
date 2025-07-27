import React, { useState, useEffect } from 'react'
import { Book, Search, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { EBook } from '../types'
import { EBookCard } from '../components/EBookCard'
import { QRCodeDisplay } from '../components/QRCodeDisplay'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useLanguage } from '../contexts/LanguageContext'

interface HomePageProps {
  onViewEbook: (id: string) => void
}

export const HomePage: React.FC<HomePageProps> = ({ onViewEbook }) => {
  const [ebooks, setEbooks] = useState<EBook[]>([])
  const [filteredEbooks, setFilteredEbooks] = useState<EBook[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEbook, setSelectedEbook] = useState<EBook | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    fetchEbooks()
  }, [])

  useEffect(() => {
    filterEbooks()
  }, [searchTerm, ebooks])

  const fetchEbooks = async () => {
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEbooks(data || [])
    } catch (error) {
      console.error('Error fetching ebooks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterEbooks = () => {
    if (!searchTerm.trim()) {
      setFilteredEbooks(ebooks)
      return
    }

    const filtered = ebooks.filter(ebook =>
      ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebook.title_lo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebook.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebook.description_lo.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredEbooks(filtered)
  }

  const handleShowQR = (ebook: EBook) => {
    setSelectedEbook(ebook)
    setShowQR(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('Loading...', 'ກໍາລັງໂຫລດ...')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-xl">
                <Book className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  {t('FlipBook Library', 'ຫ້ອງສະໝຸດ FlipBook')}
                </h1>
                <p className="text-gray-600 text-sm">
                  {t('Discover amazing digital books', 'ຄົ້ນພົບປຶ້ມດີຈິຕອນທີ່ຫນ້າສົນໃຈ')}
                </p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('Search for eBooks...', 'ຄົ້ນຫາປຶ້ມ...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 text-center">
          <p className="text-gray-600">
            {t(`Found ${filteredEbooks.length} eBooks`, `ພົບ ${filteredEbooks.length} ປຶ້ມ`)}
          </p>
        </div>

        {/* eBooks Grid */}
        {filteredEbooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEbooks.map((ebook) => (
              <EBookCard
                key={ebook.id}
                ebook={ebook}
                onView={onViewEbook}
                onShowQR={handleShowQR}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm 
                  ? t('No eBooks found', 'ບໍ່ພົບປຶ້ມ')
                  : t('No eBooks available', 'ບໍ່ມີປຶ້ມ')
                }
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? t('Try searching with different keywords', 'ລອງຄົ້ນຫາດ້ວຍຄໍາສໍາຄັນອື່ນ')
                  : t('Check back later for new releases', 'ກວດສອບຄືນພາຍຫລັງສໍາລັບການປ່ອຍໃໝ່')
                }
              </p>
            </div>
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      {showQR && selectedEbook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <QRCodeDisplay
              url={`${window.location.origin}/view/${selectedEbook.id}`}
              title={selectedEbook.title}
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