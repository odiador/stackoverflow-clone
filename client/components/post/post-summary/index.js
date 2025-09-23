import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'

import { AuthContext } from '../../../store/auth'
import { FetchContext } from '../../../store/fetch'

import Tag from '../../tag'

import styles from './post-summary.module.css'

const PostSummary = ({
  tags,
  author,
  created,
  questionId,
  answerId,
  setQuestion,
  children
}) => {
  const { authState, isAdmin } = useContext(AuthContext)
  const { authAxios } = useContext(FetchContext)
  const router = useRouter()
  const [rendered, setRendered] = useState(null)

  useEffect(() => {
    const renderContent = async () => {
      if (!children) return setRendered('')

      // If children seems to be HTML (stored server-side), use as-is
      if (typeof children === 'string' && children.trim().startsWith('<')) {
        // sanitize HTML on client
        const DOMPurify = (await import('dompurify')).default
        setRendered(DOMPurify.sanitize(children))
        return
      }

      // Otherwise treat as markdown and convert to HTML
      if (typeof children === 'string' || typeof children === 'number') {
        const mod = await import('marked')
        const markedLib = mod.marked || mod.default || mod
        const contentStr = String(children)
        const html = markedLib.parse(contentStr)
        const DOMPurify = (await import('dompurify')).default
        setRendered(DOMPurify.sanitize(html))
        return
      }

      // For React nodes, render directly
      setRendered(null)
    }

    renderContent()
  }, [children])

  const handleDeleteComment = async () => {
    const res = window.confirm('Are you sure delete your post?')
    if (res) {
      const { data } = await authAxios.delete(
        answerId
          ? `/answer/${questionId}/${answerId}`
          : `/question/${questionId}`
      )

      if (answerId) {
        setQuestion(data)
      } else {
        router.push('/')
      }
    }
  }

  return (
    <div className={styles.postCell}>
      <div className={styles.text}>
        {rendered ? (
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        ) : (
          children
        )}
      </div>
      <div className={styles.footer}>
        <div className={styles.row}>
          <div className={styles.tagContainer}>
            {tags && tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
          <div className={styles.userDetails}>
            <Link href="/users/[user]" as={`/users/${author.username}`}>
              <a>
                <img
                  src={`https://secure.gravatar.com/avatar/${author.id}?s=32&d=identicon`}
                  alt={author.username}
                />
              </a>
            </Link>
            <div className={styles.info}>
              <span>
                {tags ? 'asked' : 'answered'}{' '}
                {formatDistanceToNowStrict(new Date(created), {
                  addSuffix: true
                })}
              </span>
              <Link href="/users/[user]" as={`/users/${author.username}`}>
                <a>{author.username}</a>
              </Link>
            </div>
          </div>
        </div>
  {(authState.userInfo && authState.userInfo.id === author.id || isAdmin()) && (
          <div className={styles.row}>
            <a className={styles.delete} onClick={() => handleDeleteComment()}>
              delete
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostSummary
