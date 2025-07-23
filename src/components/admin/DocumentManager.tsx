"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Download,
  Plus,
  Eye,
  MoreVertical
} from 'lucide-react'
import { localDB, Document } from '@/lib/localStorage'
import { useLocalAuth } from '@/components/auth/LocalAuthProvider'
import { logActivity } from '@/lib/audit/auditLogger'
import { analyzeDocument, isGeminiConfigured } from '@/lib/geminiDocumentAnalysis'

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedRegulator, setSelectedRegulator] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const { user } = useLocalAuth()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const data = localDB.documents.getAll()
      // Sort by created_at descending
      const sortedData = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setDocuments(sortedData)
    } catch (error) {
      console.error('Error fetching documents:', error)
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const success = localDB.documents.delete(id)
      if (success) {
        setDocuments(documents.filter(doc => doc.id !== id))
        logActivity('DELETE', user?.email || 'unknown', `Deleted document ${id}`);
      } else {
        throw new Error('Document not found')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Error deleting document. Please try again.')
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      act: 'bg-red-100 text-red-800 border-red-200',
      regulation: 'bg-blue-100 text-blue-800 border-blue-200',
      policy: 'bg-green-100 text-green-800 border-green-200',
      rule: 'bg-purple-100 text-purple-800 border-purple-200',
      directive: 'bg-orange-100 text-orange-800 border-orange-200',
      guideline: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      form: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || doc.type === selectedType
    const matchesRegulator = selectedRegulator === 'all' || doc.regulator === selectedRegulator
    
    return matchesSearch && matchesType && matchesRegulator
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-brand-navy">Document Management</h2>
        </div>
        <Card className="bg-white/90 backdrop-blur-sm border-brand-blue/20">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setShowUploadModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Search className="h-5 w-5" />
            Search & Filter Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Document Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="act">Acts</option>
                <option value="regulation">Regulations</option>
                <option value="policy">Policies</option>
                <option value="rule">Rules</option>
                <option value="directive">Directives</option>
                <option value="guideline">Guidelines</option>
                <option value="form">Forms</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Regulator</label>
              <select
                value={selectedRegulator}
                onChange={(e) => setSelectedRegulator(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Regulators</option>
                <option value="Bank of Botswana">Bank of Botswana</option>
                <option value="NBFIRA">NBFIRA</option>
                <option value="Financial Intelligence Agency">Financial Intelligence Agency</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredDocuments.length}</span> documents
        </p>
        <Badge variant="outline" className="text-blue-600 border-blue-300">
          {documents.length} Total Documents
        </Badge>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                      <Badge className={getTypeColor(doc.type) + " border text-xs capitalize"}>
                        {doc.type}
                      </Badge>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        {doc.regulator}
                      </Badge>
                    </div>

                    <p className="text-gray-600 mb-3">{doc.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>Category: {doc.category}</span>
                      <span>Status: {doc.status}</span>
                      <span>Updated: {new Date(doc.updated_at).toLocaleDateString()}</span>
                      {doc.file_size && <span>Size: {doc.file_size}</span>}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-brand-blue/30 text-brand-blue">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Documents Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedType !== 'all' || selectedRegulator !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Start by uploading your first document'
                }
              </p>
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <DocumentUploadModal 
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false)
            fetchDocuments()
          }}
        />
      )}
    </div>
  )
}

function DocumentUploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'regulation',
    regulator: 'Bank of Botswana',
    category: '',
    tags: '',
    priority: 'medium',
    status: 'active',
    content: ''
  })
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const { user } = useLocalAuth()

  useEffect(() => {
    if (file) {
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setTitleSuggestions([
        baseName,
        baseName.replace(/_/g, " "),
        baseName.replace(/-/g, " "),
        baseName.replace(/_/g, " ").replace(/-/g, " "),
        `${baseName} (${formData.type})`,
        `${baseName} - ${formData.regulator}`
      ]);
      setTagSuggestions([
        ...baseName.split(/[_\-\s]+/).filter(Boolean),
        formData.type,
        formData.regulator
      ]);
      setCategorySuggestions([
        formData.type,
        formData.regulator,
        `${baseName} Category`
      ]);
    } else {
      setTitleSuggestions([]);
      setTagSuggestions([]);
      setCategorySuggestions([]);
    }
  }, [file, formData.type, formData.regulator]);

  // Gemini analysis after file upload
  useEffect(() => {
    const runAnalysis = async () => {
      if (file && isGeminiConfigured()) {
        setAnalysisLoading(true);
        setAnalysisError(null);
        try {
          const content = await file.text();
          const result = await analyzeDocument(content, file.name);
          setFormData(prev => ({
            ...prev,
            title: result.title || prev.title,
            tags: result.tags.join(', '),
            category: result.documentType || prev.category,
            description: result.summary || prev.description,
            type: result.documentType || prev.type,
          }));
        } catch (err: any) {
          setAnalysisError(err.message || 'AI analysis failed');
        } finally {
          setAnalysisLoading(false);
        }
      }
    };
    runAnalysis();
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    try {
      const documentData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        entity_types: ['All Financial Institutions'],
        created_by: user?.id || 'unknown',
        type: formData.type as Document['type'],
        status: formData.status as Document['status'],
        priority: formData.priority as Document['priority']
      }
      localDB.documents.create(documentData)
      logActivity('FILE_UPLOAD', user?.email || 'unknown', `Uploaded document ${documentData.title}`);
      onSuccess()
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Error uploading document. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-gray-900">Upload New Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col items-start">
            <label className="font-semibold mb-2">Select file to upload</label>
            <input type="file" accept=".pdf,.txt" onChange={e => setFile(e.target.files?.[0] || null)} className="border px-3 py-2 rounded bg-gray-50" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Document title"
                    required
                  />
                </div>
                {titleSuggestions.length > 0 && (
                  <div className="mt-1 flex gap-2 flex-wrap">
                    {titleSuggestions.map((s, i) => (
                      <Button key={i} type="button" size="sm" variant="outline" onClick={() => setFormData({...formData, title: s})}>{s}</Button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="act">Act</option>
                  <option value="regulation">Regulation</option>
                  <option value="policy">Policy</option>
                  <option value="rule">Rule</option>
                  <option value="directive">Directive</option>
                  <option value="guideline">Guideline</option>
                  <option value="form">Form</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Document description"
                className="w-full p-2 border border-gray-300 rounded-md h-24"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Regulator</label>
                <select
                  value={formData.regulator}
                  onChange={(e) => setFormData({...formData, regulator: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="Bank of Botswana">Bank of Botswana</option>
                  <option value="NBFIRA">NBFIRA</option>
                  <option value="Financial Intelligence Agency">Financial Intelligence Agency</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g., Banking, Insurance"
                  required
                />
                {categorySuggestions.length > 0 && (
                  <div className="mt-1 flex gap-2 flex-wrap">
                    {categorySuggestions.map((s, i) => (
                      <Button key={i} type="button" size="sm" variant="outline" onClick={() => setFormData({...formData, category: s})}>{s}</Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tags (comma-separated)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="e.g., licensing, capital, compliance"
              />
              {tagSuggestions.length > 0 && (
                <div className="mt-1 flex gap-2 flex-wrap">
                  {tagSuggestions.map((s, i) => (
                    <Button key={i} type="button" size="sm" variant="outline" onClick={() => setFormData({...formData, tags: formData.tags ? formData.tags + ',' + s : s})}>{s}</Button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
            {/* Analysis Loading/Error State */}
            {analysisLoading && <div className="text-blue-600">Analyzing document with AI...</div>}
            {analysisError && <div className="text-red-600">{analysisError}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}