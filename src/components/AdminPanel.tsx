import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, Upload } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { EBook } from '../types'
import { useLanguage } from '../contexts/LanguageContext'

export const AdminPanel: React.FC = () => {
  const [ebooks, setEbooks] = useState<EBook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    title: '',
    title_lo: '',
    description: '',
    description_lo: '',
    cover_image: '',
    pages: [''],
    background_music: '',
    youtube_url: '',
    is_public: true
  })

  useEffect(() => {
    fetchEbooks()
  }, [])

  const fetchEbooks = async () => {
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEbooks(data || [])
    } catch (error) {
      console.error('Error fetching ebooks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('ebooks')
        .insert([{
          ...formData,
          pages: formData.pages.filter(page => page.trim() !== ''),
          view_count: 0
        }])

      if (error) throw error
      
      setFormData({
        title: '',
        title_lo: '',
        description: '',
        description_lo: '',
        cover_image: '',
        pages: [''],
        background_music: '',
        youtube_url: '',
        is_public: true
      })
      setShowAddForm(false)
      fetchEbooks()
    } catch (error) {
      console.error('Error adding ebook:', error)
    }
  }

  const deleteEbook = async (id: string) => {
    if (!confirm(t('Are you sure you want to delete this eBook?', 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບປຶ້ມນີ້?'))) return

    try {
      const { error } = await supabase
        .from('ebooks')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchEbooks()
    } catch (error) {
      console.error('Error deleting ebook:', error)
    }
  }

  const addPageField = () => {
    setFormData(prev => ({
      ...prev,
      pages: [...prev.pages, '']
    }))
  }

  const updatePageField = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.map((page, i) => i === index ? value : page)
    }))
  }

  const removePageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    field: 'cover_image' | 'page',
    pageIndex?: number
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${field === 'cover_image' ? 'covers' : 'pages'}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('ebook-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('ebook-images')
        .getPublicUrl(filePath)
      
      if (field === 'cover_image') {
        setFormData(prev => ({ ...prev, cover_image: publicUrl }))
      } else if (field === 'page' && pageIndex !== undefined) {
        const newPages = [...formData.pages]
        newPages[pageIndex] = publicUrl
        setFormData(prev => ({ ...prev, pages: newPages }))
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(t('Upload failed', 'ອັບໂຫລດລົ້ມເຫຼວ'))
    }
  }

  const handleMultipleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      const newPages = [...formData.pages]
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `pages/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('ebook-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('ebook-images')
          .getPublicUrl(filePath)

        newPages.push(publicUrl)
      }
      
      setFormData(prev => ({ ...prev, pages: newPages }))
    } catch (error) {
      console.error('Multiple upload error:', error)
      alert(t('Upload failed', 'ອັບໂຫລດລົ້ມເຫຼວ'))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('Loading...', 'ກໍາລັງໂຫລດ...')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {t('Admin Panel - Manage eBooks', 'ແຜງຄວບຄຸມ - ຈັດການປຶ້ມ')}
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{t('Add New eBook', 'ເພີ່ມປຶ້ມໃໝ່')}</span>
          </button>
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">{t('Add New eBook', 'ເພີ່ມປຶ້ມໃໝ່')}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('Title (English)', 'ຫົວຂໍ້ (ອັງກິດ)')}
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('Title (Lao)', 'ຫົວຂໍ້ (ລາວ)')}
                    </label>
                    <input
                      type="text"
                      value={formData.title_lo}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_lo: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('Description (English)', 'ຄໍາອະທິບາຍ (ອັງກິດ)')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('Description (Lao)', 'ຄໍາອະທິບາຍ (ລາວ)')}
                    </label>
                    <textarea
                      value={formData.description_lo}
                      onChange={(e) => setFormData(prev => ({ ...prev, description_lo: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Cover Image', 'ຮູບປົກ')}
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="url"
                      value={formData.cover_image}
                      onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/cover.jpg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('cover-upload')?.click()}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                    >
                      {t('Upload', 'ອັບໂຫລດ')}
                    </button>
                    <input
                      type="file"
                      id="cover-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'cover_image')}
                    />
                  </div>
                  {formData.cover_image && (
                    <div className="mt-2">
                      <img 
                        src={formData.cover_image} 
                        alt="Cover preview" 
                        className="h-32 object-contain rounded border border-gray-300"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Background Music URL (Optional)', 'URL ດົນຕີພື້ນຫລັງ (ທາງເລືອກ)')}
                  </label>
                  <input
                    type="url"
                    value={formData.background_music}
                    onChange={(e) => setFormData(prev => ({ ...prev, background_music: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/music.mp3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('YouTube URL (Optional)', 'URL YouTube (ທາງເລືອກ)')}
                  </label>
                  <input
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('Use either Music URL or YouTube URL, not both', 'ໃຊ້ URL ດົນຕີ ຫຼື YouTube URL ພຽງອັນໃດອັນໜຶ່ງ')}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('Pages', 'ໜ້າ')}
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={addPageField}
                        className="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t('Add Page', 'ເພີ່ມໜ້າ')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => document.getElementById('pages-upload')?.click()}
                        className="text-green-500 hover:text-green-600 text-sm flex items-center space-x-1"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{t('Upload Multiple', 'ອັບໂຫລດຫຼາຍໜ້າ')}</span>
                      </button>
                      <input
                        type="file"
                        id="pages-upload"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleMultipleUpload}
                      />
                    </div>
                  </div>
                  
                  {formData.pages.map((page, index) => (
                    <div key={index} className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="url"
                          value={page}
                          onChange={(e) => updatePageField(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`${t('Page', 'ໜ້າ')} ${index + 1} URL`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById(`page-upload-${index}`)?.click()}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors"
                        >
                          {t('Upload', 'ອັບໂຫລດ')}
                        </button>
                        <input
                          type="file"
                          id={`page-upload-${index}`}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'page', index)}
                        />
                        {formData.pages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePageField(index)}
                            className="text-red-500 hover:text-red-600 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {page && (
                        <div className="mt-1">
                          <img 
                            src={page} 
                            alt={`Page ${index+1} preview`} 
                            className="h-24 object-contain rounded border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_public" className="text-sm text-gray-700">
                    {t('Make this eBook public', 'ເຮັດໃຫ້ປຶ້ມນີ້ເປັນສາທາລະນະ')}
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {t('Cancel', 'ຍົກເລີກ')}
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {t('Add eBook', 'ເພີ່ມປຶ້ມ')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* eBooks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ebooks.map((ebook) => (
            <div key={ebook.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={ebook.cover_image}
                alt={ebook.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{ebook.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ebook.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>{ebook.pages.length} {t('pages', 'ໜ້າ')}</span>
                  <span>{ebook.view_count} {t('views', 'ຄັ້ງ')}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => deleteEbook(ebook.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t('Delete', 'ລົບ')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {ebooks.length === 0 && (
          <div className="text-center py-12">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {t('No eBooks yet', 'ຍັງບໍ່ມີປຶ້ມ')}
            </h3>
            <p className="text-gray-500">
              {t('Start by adding your first eBook', 'ເລີ່ມໂດຍການເພີ່ມປຶ້ມຄັ້ງທໍາອິດຂອງທ່ານ')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
