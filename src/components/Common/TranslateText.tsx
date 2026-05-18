import { useState } from 'react'
import type { CSSProperties } from 'react'

interface TranslateTextProps {
  ko: string
  zh: string
  koStyle?: CSSProperties
  zhStyle?: CSSProperties
  className?: string
}

const koreanPattern = /[\u3131-\u318e\uac00-\ud7a3]/u

const exactKoTranslations: Record<string, string> = {
  '이 커플 너무 예뻐요 😭💕': '这对太好嗑了，真的好漂亮 😭💕',
  '그냥 친한 사이일 수도 있잖아요': '也可能只是关系比较好的朋友吧。',
  '이거 터지면 대박 ㅋㅋ': '这个要是爆出来就大发了哈哈。',
  '무슨 일이에요? 새 팬이라 모르겠어요': '发生什么事了？我是新粉还不太清楚。',
  '진짜 연애 중이면 어떡하지... 😢': '如果真的在恋爱怎么办……😢',
  '이 타임라인 보면 확실히 겹치는데...': '看这条时间线的话，确实有重合的地方……',
  '분석 너무 깊게 들어가는 거 아냐?': '这是不是分析得太过了？',
  '이건 뭔가 있어!! 진실이 곧 나올 것이다': '这里面肯定有事！真相很快就会出来。',
  '음모론 그만... 팬들 이미지 안 좋아져': '别再阴谋论了……粉丝形象会变差。',
  '아이돌 연애하면 팬 배신인데': '爱豆谈恋爱不就是背叛粉丝吗。',
  '연애 자유입니다. 그만 좀 하세요': '恋爱是自由的，别再这样了。',
  'RIIZE 화이팅! 💪': 'RIIZE 加油！💪',
  '글쎄요...': '不好说……',
  '오빠 너무 잘생겼어요! 💕': '哥哥太帅了！💕',
  '이 사진 어디서 찍은 거야? 배경이...': '这张照片是在哪里拍的？背景好像……',
  '항상 응원합니다! 건강 챙기세요 🙏': '一直支持你！要注意身体 🙏',
  '이 반지... 혹시 커플링?': '这个戒指……不会是情侣戒吧？',
  '뒤에 여자 그림자 보이는데??': '后面是不是有女生的影子？？',
  '노래 좋아요~': '歌很好听～',
  '예쁘다! 😍': '好漂亮！😍',
  '어디야? 가보고 싶다': '这是哪里？我也想去。',
  '이 위치 팬들 사이에서 화제임': '这个地点已经在粉丝之间被讨论了。',
  '이 기사 뭔가 석연찮은데?': '这篇报道感觉有点不对劲？',
  '아이돌 사생활 존중해주세요': '请尊重爱豆的私生活。',
  '연예인 연애는 원래 이렇게 시작됨': '艺人恋爱新闻本来就是这样开始的。',
  '또 연애 스캔들? 요즘 아이돌들은...': '又是恋爱绯闻？现在的爱豆真是……',
  '팬들 멘탈 챙겨주세요 ㅠㅠ': '请照顾一下粉丝的心态吧 ㅠㅠ',
  '이 타이밍에 이 기사가 나온 건 우연이 아니다': '这个时间点出这篇报道，不可能只是巧合。',
  '그냥 기사 하나일 뿐인데 오버반응 ㄱㄱ': '不过就是一篇报道，反应太夸张了。',
}

function fallbackTranslateKo(text: string): string {
  const compact = text.trim()
  if (!compact) return ''
  if (/[\u4e00-\u9fff]/u.test(compact)) return compact

  const normalized = compact.replace(/\s+/g, ' ')
  if (exactKoTranslations[normalized]) return exactKoTranslations[normalized]

  const rules: Array<[RegExp, string]> = [
    [/커플|럽스타|연애|열애/u, '评论在猜是不是恋爱、情侣暗号或 Lovestagram。'],
    [/친한 사이|친구/u, '这条是在说也许只是关系亲近，不一定是恋爱。'],
    [/타임라인|겹치|시간/u, '有人在对比时间线，觉得行程和上线时间有重合。'],
    [/터지면|대박|진실|곧 나올/u, '评论在等事情爆出来，语气像看热闹。'],
    [/무슨 일이|모르겠/u, '新粉在问发生了什么，还没跟上这次讨论。'],
    [/사생활|존중/u, '有人在提醒大家尊重私生活。'],
    [/배신|스캔들/u, '这条评论在指责恋爱绯闻，会刺激粉圈情绪。'],
    [/사진|배경|그림자|반지|커플링|위치/u, '评论在放大照片细节，怀疑背景、同款或地点有线索。'],
    [/응원|화이팅|건강/u, '这是普通应援评论，在夸他并提醒注意身体。'],
    [/예쁘|잘생/u, '这条是在夸照片好看、本人状态好。'],
    [/회사|매니저|공지/u, '有人提到公司、经纪人或通知，担心公司会介入。'],
    [/팬|브리즈|팬덤/u, '评论在从粉丝视角讨论这件事。'],
    [/진짜|어떡/u, '这条语气比较慌，像是在担心传闻成真。'],
  ]

  const matched = rules.find(([pattern]) => pattern.test(compact))
  if (matched) return matched[1]
  return '这条评论语气偏口语，暂时只能判断大意：有人在围观、猜测或表达情绪。'
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
          {show ? '收起翻译' : '查看翻译'}
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
    const trimmed = line.trim()
    const parentheticalZh = trimmed.match(/^(.*?)[（(]([\u4e00-\u9fff].*?)[）)]$/u)
    if (parentheticalZh && koreanPattern.test(parentheticalZh[1])) {
      koLines.push(parentheticalZh[1].trim())
      zhLines.push(parentheticalZh[2].trim())
    } else if (koreanPattern.test(trimmed)) {
      koLines.push(trimmed)
    } else if (/[\u4e00-\u9fff]/u.test(trimmed)) {
      zhLines.push(trimmed)
    } else {
      koLines.push(trimmed)
    }
  }

  const ko = koLines.join('\n')
  const zh = zhLines.join('\n') || fallbackTranslateKo(ko)
  return { ko, zh }
}

interface TranslateLinkProps {
  ko: string
  zh: string
  style?: CSSProperties
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
