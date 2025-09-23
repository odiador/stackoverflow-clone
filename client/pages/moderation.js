import React, { useEffect, useState, useContext } from 'react'
import Head from 'next/head'
import Layout from '../components/layout'
import { FetchContext } from '../store/fetch'
import PageTitle from '../components/page-title'

import styles from '../styles/moderation.module.css'

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
            <p className={styles.meta}>asked by {q.author && q.author.username}</p>

            <div className={styles.answers}>
              {q.answers
                .filter(a => a.isAIGenerated && a.aiValidationStatus === 'pending')
                .map((a) => (
                  <div key={a._id} className={styles.answer}>
                    <div className={styles.answerBody}>
                      <div className="markdown-content" dangerouslySetInnerHTML={{ __html: a.text }} />
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
