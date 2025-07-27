import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Share2, Download } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

interface QRCodeDisplayProps {
  url: string
  title: string
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ url, title }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const { t } = useLanguage()

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1f2937',
        light: '#ffffff'
      }
    }).then(setQrCodeUrl)
  }, [url])

  const downloadQR = () => {
    const link = document.createElement('a')
    link.download = `qr-${title}.png`
    link.href = qrCodeUrl
    link.click()
  }

  const shareUrl = async () => {
    if (navigator.share) {
      await navigator.share({
        title: title,
        url: url
      })
    } else {
      await navigator.clipboard.writeText(url)
      alert(t('Link copied to clipboard!', 'ລິ້ງຄັດລອກແລ້ວ!'))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        {t('Share this eBook', 'ແບ່ງປັນປຶ້ມ')}
      </h3>
      
      {qrCodeUrl && (
        <div className="flex flex-col items-center space-y-4">
          <img src={qrCodeUrl} alt="QR Code" className="rounded-lg shadow-sm" />
          
          <div className="flex space-x-3">
            <button
              onClick={shareUrl}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('Share', 'ແບ່ງປັນ')}</span>
            </button>
            
            <button
              onClick={downloadQR}
              className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t('Download', 'ດາວໂຫລດ')}</span>
            </button>
          </div>
          
          <div className="text-xs text-gray-500 text-center max-w-full">
            <p className="break-all">{url}</p>
          </div>
        </div>
      )}
    </div>
  )
}