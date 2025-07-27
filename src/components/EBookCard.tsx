import React from 'react'
import { Eye, Clock, QrCode } from 'lucide-react'
import { EBook } from '../types'
import { useLanguage } from '../contexts/LanguageContext'

interface EBookCardProps {
  ebook: EBook
  onView: (id: string) => void
  onShowQR: (ebook: EBook) => void
}

export const EBookCard: React.FC<EBookCardProps> = ({ ebook, onView, onShowQR }) => {
  const { language, t } = useLanguage()
  
  const title = language === 'lo' ? ebook.title_lo : ebook.title
  const description = language === 'lo' ? ebook.description_lo : ebook.description

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden">
        <img
          src={ebook.cover_image}
          alt={title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-4 right-4">
          <button
            onClick={() => onShowQR(ebook)}
            className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{ebook.view_count}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{ebook.pages.length} {t('pages', 'ໜ້າ')}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onView(ebook.id)}
          className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02]"
        >
          {t('Read Now', 'ອ່ານດຽວນີ້')}
        </button>
      </div>
    </div>
  )
}