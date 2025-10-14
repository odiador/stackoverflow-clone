import React, { useEffect, useState, useContext } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { publicFetch, baseURL } from '../../util/fetcher'
import { FetchContext } from '../../store/fetch'

import Layout from '../../components/layout'
import PageTitle from '../../components/page-title'
import DetailPageContainer from '../../components/detail-page-container'
import PostWrapper from '../../components/post/post-wrapper'
import PostVote from '../../components/post/post-vote'
import PostSummary from '../../components/post/post-summary'
import CommentList from '../../components/post/comment-list'
import CommentItem from '../../components/post/comment-list/comment-item'
import AnswerContainer from '../../components/answer-container'
import AddAnswer from '../../components/add-answer'
import { Spinner } from '../../components/icons'

const QuestionDetail = ({ questionId: questionIdProp, title: titleProp }) => {
  const router = useRouter()
  const { authAxios } = useContext(FetchContext)
  
  // Extract questionId from router if not available in props
  const slug = router.query.slug
  const questionId = questionIdProp || (slug ? slug.split('-').shift() : null)
  const title = titleProp || (slug ? slug.substr(slug.indexOf('-') + 1).split('-').join(' ') : '')
  
  const [question, setQuestion] = useState(null)
  const [answerSortType, setAnswersSortType] = useState('Votes')
  const [aiResponse, setAiResponse] = useState('')
  const [isAiGenerating, setIsAiGenerating] = useState(false)

  // Function to safely sanitize HTML
  const sanitizeHTML = async (markdownText) => {
    // Import marked dynamically
    const { marked } = await import('marked')
    
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

  useEffect(() => {
    // Don't fetch if questionId is not available
    if (!questionId) return
    
    const fetchQuestion = async () => {
      try {
        const { data } = await publicFetch.get(`/question/${questionId}`)
        setQuestion(data)
      } catch (error) {
        console.error('Error fetching question:', error)
      }
    }

    fetchQuestion()
    
    // Poll for AI responses for the first 30 seconds after page load
    // This helps catch auto-generated AI responses when questions are newly created
    let pollCount = 0
    const maxPolls = 15 // Poll for 30 seconds (15 polls x 2 seconds)
    
    const pollInterval = setInterval(async () => {
      pollCount++
      
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval)
        return
      }
      
      try {
        const { data } = await publicFetch.get(`/question/${questionId}`)
        setQuestion(data)
        
        // Stop polling if we detect an AI response
        const hasAIResponse = data.answers?.some(answer => answer.isAIGenerated)
        if (hasAIResponse) {
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error('Error polling for updates:', error)
        // Stop polling if there's a persistent error
        clearInterval(pollInterval)
      }
    }, 2000) // Poll every 2 seconds
    
    return () => clearInterval(pollInterval)
  }, [questionId])

  const streamAIResponse = async (questionId) => {
    setIsAiGenerating(true)
    setAiResponse('')
    
    try {
      const eventSource = new EventSource(`${baseURL}/questions/${questionId}/ai-stream`)
      let accumulatedMarkdown = ''
      
      eventSource.onmessage = async (event) => {
        const data = JSON.parse(event.data)
        
        if (data.error) {
          console.error('AI Response Error:', data.error)
          eventSource.close()
          setIsAiGenerating(false)
          return
        }
        
        if (data.isComplete) {
          eventSource.close()
          setIsAiGenerating(false)
          // Convert final markdown to HTML and sanitize
          const htmlContent = await sanitizeHTML(data.fullResponse)
          setAiResponse(htmlContent)
        } else {
          // Accumulate markdown during streaming
          accumulatedMarkdown += data.content
          setAiResponse(accumulatedMarkdown)
        }
      }
      
      eventSource.onerror = () => {
        eventSource.close()
        setIsAiGenerating(false)
        console.error('Error connecting to AI stream')
      }
      
    } catch (error) {
      console.error('Error starting AI stream:', error)
      setIsAiGenerating(false)
    }
  }

  const generateAndSaveAIResponse = async (questionId) => {
    setIsAiGenerating(true)
    setAiResponse('')
    
    try {
      // Call the endpoint that saves the AI response with AI_Assistant account
      // Using authAxios because the endpoint requires authentication
      const { data } = await authAxios.post(`/questions/${questionId}/ai-response`)
      
      if (data.message) {
        console.log(data.message)
      }
      
      // Reload the question to show the new answer
      const updatedQuestion = await publicFetch.get(`/question/${questionId}`)
      setQuestion(updatedQuestion.data)
      
      setIsAiGenerating(false)
      
      // Show success message
      setAiResponse('✅ AI response generated and saved successfully! Check the answers below.')
      
    } catch (error) {
      console.error('Error generating AI response:', error)
      setIsAiGenerating(false)
      setAiResponse(`❌ Error: ${error.response?.data?.message || error.message}`)
    }
  }

  const testMarkdownResponse = async () => {
    setIsAiGenerating(true)
    
    // Simular contenido markdown de ejemplo
    const sampleMarkdown = `# Respuesta de Ejemplo

Esta es una **respuesta de prueba** para verificar el renderizado de *markdown*.

## Código de Ejemplo

Aquí tienes un ejemplo de código JavaScript:

\`\`\`javascript
function ejemplo() {
    const mensaje = "¡Hola mundo!"
    console.log(mensaje)
    return mensaje
}
\`\`\`

## Lista de Características

- **Encabezados** con diferentes niveles
- *Texto en cursiva* y **texto en negrita**
- \`Código inline\` para resaltar
- Bloques de código con syntax highlighting

### Tabla de Ejemplo

| Característica | Estado | Descripción |
|---------------|--------|-------------|
| Markdown | ✅ | Funcionando |
| Código | ✅ | Con colores |
| Tablas | ✅ | Responsive |

> **Nota importante:** Este es un blockquote para resaltar información importante.

¿Te ayuda esta respuesta? ¡Espero que sí!`

    // Simular streaming
    let index = 0
    const interval = setInterval(async () => {
      if (index < sampleMarkdown.length) {
        const chunk = sampleMarkdown.slice(0, index + 20)
        setAiResponse(chunk)
        index += 20
      } else {
        clearInterval(interval)
        setIsAiGenerating(false)
        // Convertir a HTML al final
        const htmlContent = await sanitizeHTML(sampleMarkdown)
        setAiResponse(htmlContent)
      }
    }, 100)
  }

  useEffect(() => {
    const fetchQuestion = async () => {
      const { data } = await publicFetch.get(`/question/${questionId}`)
      setQuestion(data)
    }

    fetchQuestion()
  }, [])

  const handleSorting = () => {
    switch (answerSortType) {
      case 'Votes':
        return (a, b) => b.score - a.score
      case 'Newest':
        return (a, b) => new Date(b.created) - new Date(a.created)
      case 'Oldest':
        return (a, b) => new Date(a.created) - new Date(b.created)
      default:
        break
    }
  }

  const isClient = typeof window === 'object'

  return (
    <Layout extra={false}>
      <Head>
        <title>{title}</title>
        <link rel="canonical" href={isClient && window.location.href}></link>
      </Head>

      <PageTitle title={title} button />

      <DetailPageContainer>
        {!question && (
          <div className="loading">
            <Spinner />
          </div>
        )}

        {question && (
          <>
            <PostWrapper borderBottom={false}>
              <PostVote
                score={question.score}
                votes={question.votes}
                questionId={questionId}
                setQuestion={setQuestion}
              />
              <PostSummary
                tags={question.tags}
                author={question.author}
                created={question.created}
                questionId={questionId}
              >
                {question.text}
              </PostSummary>
              <CommentList questionId={questionId} setQuestion={setQuestion}>
                {question.comments.map(({ id, author, created, body }) => (
                  <CommentItem
                    key={id}
                    commentId={id}
                    questionId={questionId}
                    author={author.username}
                    isOwner={author.username === question.author.username}
                    created={created}
                    setQuestion={setQuestion}
                  >
                    {body}
                  </CommentItem>
                ))}
              </CommentList>
            </PostWrapper>

            {question.answers.length > 0 && (
              <AnswerContainer
                answersCount={question.answers.length}
                answerSortType={answerSortType}
                setAnswerSortType={setAnswersSortType}
              >
                {question.answers.sort(handleSorting()).map((answer) => (
                  <PostWrapper key={answer.id}>
                    <PostVote
                      score={answer.score}
                      votes={answer.votes}
                      answerId={answer.id}
                      questionId={questionId}
                      setQuestion={setQuestion}
                    />
                    <PostSummary
                      author={answer.author}
                      created={answer.created}
                      questionId={questionId}
                      answerId={answer.id}
                      setQuestion={setQuestion}
                    >
                      {answer.text}
                    </PostSummary>
                    <CommentList
                      questionId={questionId}
                      answerId={answer.id}
                      setQuestion={setQuestion}
                    >
                      {answer.comments.map(({ id, author, created, body }) => (
                        <CommentItem
                          key={id}
                          commentId={id}
                          questionId={questionId}
                          answerId={answer.id}
                          author={author.username}
                          isOwner={author.username === question.author.username}
                          created={created}
                          setQuestion={setQuestion}
                        >
                          {body}
                        </CommentItem>
                      ))}
                    </CommentList>
                  </PostWrapper>
                ))}
              </AnswerContainer>
            )}

            <AddAnswer
              tags={question.tags}
              id={questionId}
              setQuestion={setQuestion}
            />

            {/* AI Response Section */}
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8f9fa', border: '1px solid #e3e3e3', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#0074cc' }}>AI Assistant Response</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => streamAIResponse(questionId)}
                    disabled={isAiGenerating}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isAiGenerating ? '#ccc' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isAiGenerating ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {isAiGenerating ? 'Streaming...' : 'AI Stream (Preview)'}
                  </button>
                  <button
                    onClick={() => testMarkdownResponse()}
                    disabled={isAiGenerating}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isAiGenerating ? '#ccc' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isAiGenerating ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {isAiGenerating ? 'Testing...' : 'Test Markdown'}
                  </button>
                  <button
                    onClick={() => generateAndSaveAIResponse(questionId)}
                    disabled={isAiGenerating}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isAiGenerating ? '#ccc' : '#0074cc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isAiGenerating ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {isAiGenerating ? 'Generating...' : 'Get AI Response'}
                  </button>
                </div>
              </div>

              {isAiGenerating && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #f3f3f3',
                      borderTop: '2px solid #0074cc',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ margin: 0, fontStyle: 'italic', color: '#666' }}>AI está generando una respuesta...</p>
                  </div>
                  {aiResponse && (
                    <div 
                      style={{
                        padding: '12px',
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap'
                      }}
                      className="markdown-content"
                    >
                      <pre style={{ 
                        margin: 0, 
                        fontFamily: 'inherit',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word'
                      }}>
                        {aiResponse}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {!isAiGenerating && aiResponse && (
                <div 
                  style={{
                    padding: '16px',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    lineHeight: '1.6'
                  }}
                  className="markdown-content"
                  dangerouslySetInnerHTML={{ __html: aiResponse }}
                />
              )}

              {!aiResponse && !isAiGenerating && (
                <p style={{ margin: 0, color: '#666', fontStyle: 'italic' }}>
                  Click &quot;Get AI Response&quot; to receive an AI-generated answer to this question.
                </p>
              )}
            </div>
          </>
        )}
      </DetailPageContainer>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  const slug = context.params.slug
  const questionId = slug.split('-').shift()
  const title = slug
    ? slug.substr(slug.indexOf('-') + 1)
        .split('-')
        .join(' ')
    : ''

  return {
    props: {
      questionId,
      title
    }
  }
}

export default QuestionDetail
