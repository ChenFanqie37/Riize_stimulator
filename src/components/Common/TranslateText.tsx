import { useState } from 'react'

interface TranslateTextProps {
  ko: string
  zh: string
  koStyle?: React.CSSProperties
  zhStyle?: React.CSSProperties
  className?: string
}

export function TranslateText({ ko, zh, koStyle, zhStyle, className }: TranslateTextProps) {
  const [show, setShow] = useState(false)

  if (!ko && !zh) return null

  return (
    <div className={className}>
      {ko && <div style={koStyle}>{ko}</div>}
      {zh && (
        <div
          onClick={() => setShow(!show)}
          style={{
            color: '#007AFF',
            fontSize: '12px',
            marginTop: 2,
            cursor: 'pointer',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {show ? zh : '번역 보기'}
        </div>
      )}
      {show && zh && (
        <div
          style={{
            fontSize: '12px',
            color: '#666',
            marginTop: 2,
            paddingTop: 2,
            borderTop: '0.5px solid #e5e7eb',
            ...zhStyle,
          }}
        >
          {zh}
        </div>
      )}
    </div>
  )
}

export function parseMixedText(text: string): { ko: string; zh: string } {
  if (!text) return { ko: '', zh: '' }
  const hasKorean = /[가-힣]/.test(text)
  if (!hasKorean) return { ko: '', zh: text }

  const lines = text.split('\n').filter(Boolean)
  const koLines: string[] = []
  const zhLines: string[] = []

  for (const line of lines) {
    if (/[가-힣]/.test(line)) {
      koLines.push(line)
    } else if (/[\u4e00-\u9fff]/.test(line)) {
      zhLines.push(line)
    } else {
      koLines.push(line)
    }
  }

  return { ko: koLines.join('\n'), zh: zhLines.join('\n') }
}

interface TranslateLinkProps {
  ko: string
  zh: string
  style?: React.CSSProperties
}

export function TranslateLink({ ko, zh, style }: TranslateLinkProps) {
  const [show, setShow] = useState(false)

  if (!ko || !zh) return ko ? <span style={style}>{ko}</span> : <span style={style}>{zh}</span>

  return (
    <span style={style}>
      {show ? zh : ko}
      <span
        onClick={(e) => {
          e.stopPropagation()
          setShow(!show)
        }}
        style={{
          color: '#007AFF',
          fontSize: '11px',
          marginLeft: 4,
          cursor: 'pointer',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {show ? ' 원문 보기' : ' 번역 보기'}
      </span>
    </span>
  )
}
