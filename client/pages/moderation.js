import React, { useEffect, useState, useContext } from 'react'
import Head from 'next/head'
import { marked } from 'marked'
import Layout from '../components/layout'
import { FetchContext } from '../store/fetch'
import PageTitle from '../components/page-title'

import styles from '../styles/moderation.module.css'

// Function to safely sanitize HTML (same as in question detail page)
const sanitizeHTML = async (markdownText) => {
  // Configure marked options
  marked.setOptions({
    breaks: true,  // Enable line breaks
    gfm: true,     // Enable GitHub Flavored Markdown
    headerIds: false,  // Disable header IDs for security
    mangle: false     // Don't mangle email addresses
  })
  
  const html = marked.parse(markdownText)
  
  // Only import DOMPurify on the client side
  if (typeof window !== 'undefined') {
    const DOMPurify = (await import('dompurify')).default
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 
        'blockquote', 
        'code', 'pre',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'hr'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel']
    })
  }
  
  // On server side, return the HTML as-is (marked already provides some protection)
  return html
}

// Component for rendering AI answer content
const AIAnswerContent = ({ content }) => {
  const [sanitizedContent, setSanitizedContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const processContent = async () => {
      if (content) {
        try {
          const sanitized = await sanitizeHTML(content)
          setSanitizedContent(sanitized)
        } catch (error) {
          console.error('Error sanitizing content:', error)
          setSanitizedContent(content) // fallback to original content
        }
      }
      setIsLoading(false)
    }

    processContent()
  }, [content])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div 
      className="markdown-content" 
      dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
    />
  )
}

const Moderation = () => {
  const { authAxios } = useContext(FetchContext)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState(null)

  const fetchPending = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await authAxios.get('/moderation/questions')
      setQuestions(data.questions)
    } catch (err) {
      const status = err && err.response && err.response.status
      const msg = err && err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message
      if (status === 401 || status === 403) {
        setError('Authentication required. Please login as a moderator.')
      } else {
        setError(msg)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const validate = async (questionId, answerId, action) => {
    try {
      await authAxios.patch(`/questions/${questionId}/answers/${answerId}/validate`, { action })
      // refresh
      fetchPending()
    } catch (err) {
      const msg = err && err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message
      alert(msg)
    }
  }

  return (
    <Layout>
      <Head>
        <title>Moderation - Pending AI Responses</title>
      </Head>

      <PageTitle title="AI Moderation" />

      <div className={styles.container}>
        {loading && <p>Loading...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && questions.length === 0 && <p>No pending AI responses.</p>}

        {questions.map((q) => (
          <div key={q._id} className={styles.card}>
            <h3>{q.title}</h3>
            <div className={styles.questionText}>
              <AIAnswerContent content={q.text} />
            </div>
            <p className={styles.meta}>asked by {q.author && q.author.username}</p>

            <div className={styles.answers}>
              {q.answers
                .filter(a => a.isAIGenerated && a.aiValidationStatus === 'pending')
                .map((a) => (
                  <div key={a._id} className={styles.answer}>
                    <div className={styles.answerBody}>
                      <AIAnswerContent content={a.text} />
                    </div>
                    <div className={styles.controls}>
                      <button onClick={() => validate(q._id, a._id, 'approve')} className={styles.approve}>Approve</button>
                      <button onClick={() => validate(q._id, a._id, 'reject')} className={styles.reject}>Reject</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}

export default Moderation
