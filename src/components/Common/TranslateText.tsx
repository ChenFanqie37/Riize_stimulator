import { useState } from 'react'

interface TranslateTextProps {
  ko: string
  zh: string
  koStyle?: React.CSSProperties
  zhStyle?: React.CSSProperties
  className?: string
}

const koreanPattern = /[\u3131-\u318e\uac00-\ud7a3]/u

function fallbackTranslateKo(text: string): string {
  const compact = text.trim()
  if (!compact) return ''
  if (/[\u4e00-\u9fff]/u.test(compact)) return compact

  const rules: Array<[RegExp, string]> = [
    [/삭제|지웠|내렸/u, '删掉了，反而更像心虚。'],
    [/커플|같은|반지|후드|신발|폰케이스|이어폰|향수/u, '有人在讨论同款物品和情侣痕迹。'],
    [/타임라인|시간|동선|스케줄/u, '有人在对比时间线和行程动线。'],
    [/어디|장소|찍/u, '有人在问这张照片是在哪里拍的。'],
    [/여친|연애|열애|럽스타/u, '评论在猜是不是恋爱或恋爱暗号。'],
    [/소속사|회사|매니저/u, '有人提到公司和经纪人可能会介入。'],
    [/오빠|잘생|귀엽|사랑/u, '粉丝在夸他可爱、帅气或表达喜欢。'],
    [/보고 싶|그리워/u, '他说想你，语气很软。'],
    [/조심|위험|들키/u, '对方在提醒你小心，可能会被发现。'],
    [/괜찮|미안|힘들/u, '对方在安慰你，也带着一点抱歉和疲惫。'],
  ]

  const matched = rules.find(([pattern]) => pattern.test(compact))
  if (matched) return matched[1]
  return '这条韩文内容已识别，但没有精确翻译。'
}

function resolveTranslation(ko: string, zh: string): string {
  if (zh?.trim()) return zh
  if (koreanPattern.test(ko)) return fallbackTranslateKo(ko)
  return zh
}

export function TranslateText({ ko, zh, koStyle, zhStyle, className }: TranslateTextProps) {
  const [show, setShow] = useState(false)
  const resolvedZh = resolveTranslation(ko, zh)

  if (!ko && !resolvedZh) return null

  return (
    <div className={className}>
      {ko && <div style={koStyle}>{ko}</div>}
      {resolvedZh && (
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
          {show ? resolvedZh : '查看翻译'}
        </div>
      )}
      {show && resolvedZh && (
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
          {resolvedZh}
        </div>
      )}
    </div>
  )
}

export function parseMixedText(text: string): { ko: string; zh: string } {
  if (!text) return { ko: '', zh: '' }
  const hasKorean = koreanPattern.test(text)
  if (!hasKorean) return { ko: '', zh: text }

  const lines = text.split('\n').filter(Boolean)
  const koLines: string[] = []
  const zhLines: string[] = []

  for (const line of lines) {
    if (koreanPattern.test(line)) {
      koLines.push(line)
    } else if (/[\u4e00-\u9fff]/u.test(line)) {
      zhLines.push(line)
    } else {
      koLines.push(line)
    }
  }

  const ko = koLines.join('\n')
  const zh = zhLines.join('\n') || fallbackTranslateKo(ko)
  return { ko, zh }
}

interface TranslateLinkProps {
  ko: string
  zh: string
  style?: React.CSSProperties
}

export function TranslateLink({ ko, zh, style }: TranslateLinkProps) {
  const [show, setShow] = useState(false)
  const resolvedZh = resolveTranslation(ko, zh)

  if (!ko || !resolvedZh) return ko ? <span style={style}>{ko}</span> : <span style={style}>{resolvedZh}</span>

  return (
    <span style={style}>
      {show ? resolvedZh : ko}
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
        {show ? ' 收起翻译' : ' 查看翻译'}
      </span>
    </span>
  )
}
