import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY

if (!API_KEY) {
  console.warn('Gemini API key not found. Document AI features will be disabled.')
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

export interface DocumentAnalysis {
  title: string
  summary: string
  tags: string[]
  documentType?: string
  effectiveDate?: string
  expirationDate?: string
}

export const analyzeDocument = async (fileContent: string, fileName: string): Promise<DocumentAnalysis> => {
  if (!genAI) {
    throw new Error('Gemini API not configured')
  }

  const maxRetries = 3
  const baseDelay = 1000 // 1 second
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const prompt = `
You are an AI assistant specialized in analyzing regulatory and legal documents for a financial regulatory platform in Botswana.\n\nPlease analyze the following document content and extract key information to help pre-fill a document management form.\n\nDocument filename: ${fileName}\nDocument content:\n${fileContent}\n\nPlease provide a JSON response with the following structure:\n{\n  "title": "A clear, descriptive title for the document (max 100 characters)",\n  "summary": "A comprehensive summary of the document's purpose, scope, and key provisions (2-3 paragraphs)",\n  "tags": ["array", "of", "relevant", "tags", "for", "categorization"],\n  "documentType": "best guess at document type (e.g., 'Act', 'Regulation', 'Guideline', 'Policy', 'Form')",\n  "effectiveDate": "YYYY-MM-DD format if mentioned in document, otherwise null",\n  "expirationDate": "YYYY-MM-DD format if mentioned in document, otherwise null"\n}\n\nGuidelines:\n- Focus on financial regulatory content (banking, insurance, investment, compliance)\n- Extract dates carefully - look for "effective date", "commencement date", "expiry date", etc.\n- Tags should include: regulatory area, document type, key topics, applicable entities\n- Summary should be professional and informative\n- If document appears to be in a language other than English, provide English translations\n- Be conservative with dates - only extract if clearly stated\n\nRespond only with valid JSON, no additional text.`
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      try {
        const analysis = JSON.parse(cleanedText) as DocumentAnalysis
        return {
          title: analysis.title?.substring(0, 100) || fileName.replace(/\.[^/.]+$/, ''),
          summary: analysis.summary || 'Document analysis could not generate a summary.',
          tags: Array.isArray(analysis.tags) ? analysis.tags.slice(0, 10) : [],
          documentType: analysis.documentType || undefined,
          effectiveDate: analysis.effectiveDate || undefined,
          expirationDate: analysis.expirationDate || undefined
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError)
        throw new Error('Failed to parse AI analysis response')
      }
    } catch (error: any) {
      console.error(`Gemini API error (attempt ${attempt}/${maxRetries}):`, error)
      const isRetryable = error.message?.includes('503') || 
                         error.message?.includes('overloaded') ||
                         error.message?.includes('429') ||
                         error.message?.includes('rate limit')
      if (attempt < maxRetries && isRetryable) {
        const delay = baseDelay * Math.pow(2, attempt - 1)
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      if (isRetryable) {
        throw new Error('AI service is temporarily overloaded. Please try again in a few minutes.')
      } else {
        throw new Error('Failed to analyze document with AI')
      }
    }
  }
  throw new Error('Failed to analyze document with AI')
}

export const isGeminiConfigured = (): boolean => {
  return !!API_KEY
}
