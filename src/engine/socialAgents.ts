import type { GameState, InstagramComment, NaverNews, WeversePost } from '../types/game'

export type SocialAgentRole = 'fan' | 'anti' | 'passerby' | 'company' | 'paparazzi' | 'teammateFan'
export type SocialAgentPlatform = 'instagram' | 'weverse' | 'naver'

export interface SocialAgentComment {
  id: string
  author: string
  text: string
  role: SocialAgentRole
  stance: 'support' | 'suspicious' | 'neutral' | 'critical' | 'official' | 'bait'
  isSuspicious: boolean
}

export interface SocialReactionInput {
  platform: SocialAgentPlatform
  title?: string
  content: string
  authorName?: string
  imageTags?: string[]
  heat?: number
  riskScore?: number
  fanSuspicion: number
  publicHeat: number
  stageName: string
}

const accountPools: Record<SocialAgentRole, string[]> = {
  fan: ['briize_archive', 'softlight_zip', 'stage_mood_313', 'orangeblood_riize', 'wonbinfilm'],
  anti: ['issue_room_kr', 'truth_pick_0', 'coldtake_idol', 'not_a_shipper', 'burning_q'],
  passerby: ['melon_user_42', 'scrolling_late', 'commuter_hae', 'justpassing_9', 'news_tab_open'],
  company: ['industry_staff_a', 'schedule_guard', 'backstage_notice', 'pr_room_view', 'manager_line'],
  paparazzi: ['lens_afterdark', 'parkinglot_tip', 'route_collector', 'dispatch_waiting', 'blurshot_247'],
  teammateFan: ['shipper_room', 'teamchemistry_zip', 'centerz_moment', 'unit_stage_luv', 'memberline_7'],
}

function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length]
}

function hashText(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0
  }
  return hash
}

function roleAuthor(role: SocialAgentRole, seed: number): string {
  return pick(accountPools[role], seed)
}

function inferTopic(input: SocialReactionInput): 'album' | 'romance' | 'schedule' | 'fashion' | 'daily' | 'crisis' {
  const text = `${input.title || ''} ${input.content} ${(input.imageTags || []).join(' ')}`.toLowerCase()
  if (/专辑|新歌|回归|舞台|album|song|comeback|mv|음원|컴백/.test(text)) return 'album'
  if (/恋|爱|同款|情侣|约会|女友|男友|热搜|曝光|绯闻|love|date|couple|rumor|연애|여친/.test(text)) return 'romance'
  if (/机场|行程|下班|后台|动线|停车场|schedule|airport|route|출근|퇴근/.test(text)) return 'schedule'
  if (/穿搭|衣服|戒指|项链|帽子|杯套|fashion|outfit|ring|item/.test(text)) return 'fashion'
  if (input.publicHeat > 65 || input.fanSuspicion > 65 || (input.riskScore || 0) > 55) return 'crisis'
  return 'daily'
}

function commentForRole(role: SocialAgentRole, topic: ReturnType<typeof inferTopic>, input: SocialReactionInput, seed: number): string {
  const stageName = input.stageName
  const templates: Record<SocialAgentRole, Record<typeof topic, string[]>> = {
    fan: {
      album: ['终于有人认真聊作品了，主打编曲和舞台动线才是重点，别把评论区带歪。', '这次回归状态真的好，先夸歌和舞台好吗。'],
      romance: ['别急着锤，几张图就能定恋爱也太离谱了，先等更多信息。', '我嗑归嗑，但别把他逼到不敢发日常。'],
      schedule: ['公开行程和私人时间不要混在一起扒，真的会伤到人。', '下班图看看就好，别去追非公开路线。'],
      fashion: ['同款真的很多人都有，别看到颜色一样就开始写论文。', '造型师最近很爱这个色系吧，别什么都往恋爱上扯。'],
      daily: ['这条就是普通日常吧，氛围挺好的。', '看起来心情不错，希望他最近能多休息。'],
      crisis: ['现在最重要是别扩散截图，热度越高越难收场。', '粉丝先冷静，公司不回应的时候别替黑子补证据。'],
    },
    anti: {
      album: ['越是回归期越容易拿作品挡别的事，别太天真。', '评论区这么统一，像不像有人在洗？'],
      romance: ['每次都说巧合，巧合多了就是时间线。', '别装不懂，热搜起来前都是这样一点点冒出来的。'],
      schedule: ['非公开路线都能对上，还说没事？', '停车场和下班时间才是重点，不是文案。'],
      fashion: ['同款可以撞，一整套氛围也撞就有意思了。', '杯套折痕都一样还要说巧合吗。'],
      daily: ['普通日常发成这样，不就是想让人猜吗。', '越看越像在钓评论。'],
      crisis: ['已经到这一步了还控评，只会更像真的。', '删帖、降热搜、装死，熟悉流程。'],
    },
    passerby: {
      album: ['路人觉得歌还行，评论区为什么突然吵恋爱？', '我只是来看新专辑评价的，怎么又开始扒私生活。'],
      romance: ['没追前因后果，有没有人一句话讲明白现在锤到哪了？', '路过，感觉证据还没到能下结论的程度。'],
      schedule: ['看不懂时间线，但追车这个行为本身就挺吓人。', '公开视频能讨论，非公开动线还是算了吧。'],
      fashion: ['韩娱同款太常见了吧，品牌赞助也可能一起用。', '这东西真能算证据吗，我有点跟不上。'],
      daily: ['这条内容本身挺正常的，评论区比正文精彩。', '算法又把我推到韩娱区了。'],
      crisis: ['热度这么高，公司估计很快会下场。', '这瓜先观望，反转概率看起来也不低。'],
    },
    company: {
      album: ['回归期请把讨论重心放回作品，非官方信息不要扩散。', '当前舆论有偏移，建议粉丝优先净化关键词。'],
      romance: ['建议相关账号不要继续发布暗示性内容，避免二次传播。', '如果继续出现私人联想，公司侧一定会收紧SNS。'],
      schedule: ['非公开行程被提及，需要立刻降低路线暴露。', '动线相关讨论已经越界，后续可能调整出入路线。'],
      fashion: ['造型同款会被放大，近期最好避开重复单品。', '物料细节正在被截图，造型侧需要统一口径。'],
      daily: ['日常内容暂无明显风险，但评论区需要观察。', '先记录，不建议艺人本人回应。'],
      crisis: ['危机等级上升，艺人账号、队友互动和搜索词都要同步管控。', '继续发酵会影响商务排期，建议启动替代话题。'],
    },
    paparazzi: {
      album: ['作品热度可以当掩护，但回归后台才容易出图。', '舞台结束后的两小时比舞台本身更有价值。'],
      romance: ['文案不是重点，重点是发布时间和他行程空白。', '先存，等下一张同框或者车牌。'],
      schedule: ['路线已经能画出来，差的是正脸。', '停车场、便利店、宿舍附近，三个点够拼一条线。'],
      fashion: ['同款只能当辅助，最好配合地点和时间。', '这个单品可以进证据板，但不能单独发。'],
      daily: ['普通日常也可能暴露背景反光，先放大看。', '看不到人，但能看环境。'],
      crisis: ['热度够了，预告不急，先等对方自己删或回应。', '现在发模糊图收益最大，但也最容易打草惊蛇。'],
    },
    teammateFan: {
      album: ['队友互动也很亮眼，别让私人猜测盖过团队舞台。', '新专辑评论区拜托多聊成员part分配。'],
      romance: ['如果要转移话题，不如多剪队友互动，至少不伤人。', '别把每个笑都解读成恋爱，也可能是在跟队友闹。'],
      schedule: ['今天队友也在同路线附近，别单独拎一个人出来。', '团体行程本来就会重叠，时间线别剪得太碎。'],
      fashion: ['同款也可能是团体造型或者队友互借，别急。', '队友也穿过类似的，先别锁死。'],
      daily: ['队友卖萌视频更好看，求大家把热度带回团综。', '剪一个队友reaction能不能救一下评论区。'],
      crisis: ['现在最稳的是推团队互动和舞台reaction，把恋爱词压下去。', `${stageName}和队友的营业片段可以顶一顶搜索词，但别做太假。`],
    },
  }

  return pick(templates[role][topic], seed)
}

export function generateFallbackSocialComments(input: SocialReactionInput): SocialAgentComment[] {
  const topic = inferTopic(input)
  const seed = hashText(`${input.platform}:${input.title || ''}:${input.content}:${input.heat || 0}:${input.riskScore || 0}`)
  const roles: SocialAgentRole[] = ['fan', 'anti', 'passerby', 'company', 'paparazzi', 'teammateFan']

  return roles.map((role, idx) => {
    const text = commentForRole(role, topic, input, seed + idx * 17)
    const isSuspicious = role === 'anti' || role === 'paparazzi' || (topic !== 'album' && role === 'company')
    return {
      id: `comment_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 5)}`,
      author: roleAuthor(role, seed + idx * 29),
      text,
      role,
      stance: role === 'fan' || role === 'teammateFan'
        ? 'support'
        : role === 'anti'
          ? 'critical'
          : role === 'paparazzi'
            ? 'bait'
            : role === 'company'
              ? 'official'
              : topic === 'romance' || topic === 'crisis'
                ? 'suspicious'
                : 'neutral',
      isSuspicious,
    }
  })
}

export function toInstagramComments(comments: SocialAgentComment[]): InstagramComment[] {
  return comments.map((comment) => ({
    id: comment.id,
    author: comment.author,
    text: comment.text,
    isSuspicious: comment.isSuspicious,
    role: comment.role,
    stance: comment.stance,
  }))
}

function normalizeStoredComments(comments: InstagramComment[], fallbackRole: SocialAgentRole = 'fan'): SocialAgentComment[] {
  return comments.map((comment, idx) => ({
    id: comment.id || `stored_comment_${idx}`,
    author: comment.author,
    text: comment.text,
    role: comment.role || (comment.isSuspicious ? 'anti' : fallbackRole),
    stance: comment.stance || (comment.isSuspicious ? 'suspicious' : 'support'),
    isSuspicious: comment.isSuspicious,
  }))
}

export function commentsForInstagramPost(post: GameState['instagram']['posts'][number], state: GameState): SocialAgentComment[] {
  if (post.comments.length > 0) {
    return normalizeStoredComments(post.comments)
  }

  return generateFallbackSocialComments({
    platform: 'instagram',
    content: post.text,
    authorName: post.authorName,
    imageTags: post.imageTags,
    heat: post.views,
    riskScore: post.riskScore,
    fanSuspicion: state.risk.fanSuspicion,
    publicHeat: state.risk.publicHeat,
    stageName: state.maleLead.stageName,
  })
}

export function commentsForWeversePost(post: WeversePost, state: GameState): SocialAgentComment[] {
  if (post.commentList?.length) return normalizeStoredComments(post.commentList, 'fan')
  return generateFallbackSocialComments({
    platform: 'weverse',
    title: post.title,
    content: post.content,
    heat: post.heat,
    fanSuspicion: state.risk.fanSuspicion,
    publicHeat: state.risk.publicHeat,
    stageName: state.maleLead.stageName,
  })
}

export function commentsForNaverNews(article: NaverNews, state: GameState): SocialAgentComment[] {
  if (article.commentList?.length) return normalizeStoredComments(article.commentList, 'passerby')
  return generateFallbackSocialComments({
    platform: 'naver',
    title: article.title,
    content: article.summary,
    heat: article.heat,
    fanSuspicion: state.risk.fanSuspicion,
    publicHeat: state.risk.publicHeat,
    stageName: state.maleLead.stageName,
  })
}
