import type {
  LLMResponse,
  GameEvent,
  GameState,
  EmotionLabel,
  InstagramComment,
  NarrativeTurn,
  OfflinePlan,
  OfflineAccessMode,
  OfflineSceneResult,
} from '../types/game'
import { useSettingsStore } from '../store/settingsStore'

let keyIndex = 0

function getRuntimeConfig() {
  const state = useSettingsStore.getState()
  return {
    keys: state.apiKeys.length > 0 ? state.apiKeys : ['YOUR_API_KEY_HERE'],
    baseUrl: (state.apiBaseUrl || 'https://api.deepseek.com').replace(/\/+$/, ''),
    model: state.apiModel || 'deepseek-chat',
  }
}

function getNextKey(): string {
  const config = getRuntimeConfig()
  const key = config.keys[keyIndex % config.keys.length]
  keyIndex += 1
  return key
}

export interface ChatContext {
  boyfriendName: string
  boyfriendPersona: string
  relationshipStage: string
  affection: number
  trust: number
  emotionalState: string
  recentMessages: string[]
  playerMessage: string
  week: number
  day: number
  timeOfDay: string
  weather: string
  mood: number
  secrecy: number
  companyAlert: number
  fanSuspicion: number
  memory: string[]
  recentEvents: string[]
  mentalTags: string[]
  relationshipStatus: string
  recentClues: string[]
  hiddenRiskSummary: string
  fandomStage: string
  paparazziStage: string
  riskMentionsRecently: number
  playerAskedAboutRisk: boolean
}

export interface StoryContext {
  week: number
  day: number
  narrativePhase: string
  relationshipStage: string
  affection: number
  trust: number
  mood: number
  secrecy: number
  companyAlert: number
  fanSuspicion: number
  publicHeat: number
  careerPressure: number
  recentEvents: string[]
  eventChains: string[]
  boyfriendPersona: string
  playerIdentity: string
}

export interface SocialContext {
  platform: 'instagram' | 'weverse' | 'naver'
  boyfriendName: string
  boyfriendStageName: string
  week: number
  relationshipStage: string
  fanSuspicion: number
  publicHeat: number
  recentPosts: string[]
  recentEvents: string[]
  postType?: string
}

export interface SocialAgentReactionContext {
  platform: 'instagram' | 'weverse' | 'naver'
  title?: string
  content: string
  authorName?: string
  imageTags?: string[]
  fanSuspicion: number
  publicHeat: number
  riskScore?: number
  stageName: string
  topicHint?: string
}

export interface DecoyHotSearch {
  title: string
  summary: string
  relatedSearchWords: string[]
  weverseTitle: string
  weverseContent: string
}

export interface CustomDateContext {
  idea: string
  boyfriendName: string
  boyfriendStageName: string
  boyfriendPersona: string
  relationshipStage: string
  affection: number
  trust: number
  week: number
  day: number
  secrecy: number
  fanSuspicion: number
  companyAlert: number
  paparazziStage: string
  fandomStage: string
  recentClues: string[]
}

export interface CustomDateSceneChoice {
  id: string
  text: string
  affection: number
  trust: number
  secrecy: number
  mood: number
  riskTag?: string
}

export interface CustomDatePlan {
  title: string
  risk: number
  affectionBonus: number
  secrecyImpact: number
  riskLabel: string
  riskReason: string
  scenes: Array<{
    type: 'arrival_greeting' | 'conversation' | 'activity' | 'intimate_moment' | 'unexpected_event' | 'departure'
    narrative: string
    boyfriendKo: string
    boyfriendZh: string
    choices: CustomDateSceneChoice[]
  }>
  afterMessageKo: string
  afterMessageZh: string
  delayedConsequence: string
}

export interface NarrativeGenerationContext {
  state: GameState
  source: NarrativeTurn['source']
  promptHint?: string
  freeInput?: string
}

export interface NarrativeResolutionContext {
  state: GameState
  turn: NarrativeTurn
  choiceId: 'A' | 'B' | 'C' | 'D'
  freeInput?: string
}

async function callLLMWithRetry(prompt: string, retries: number = 1): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const config = getRuntimeConfig()
      const key = getNextKey()
      const controller = new AbortController()
      const timeoutId = globalThis.setTimeout(() => controller.abort(), 12000)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      }

      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.9,
          top_p: 0.95,
          max_tokens: 2048
        })
      }).finally(() => globalThis.clearTimeout(timeoutId))
      if (!response.ok) {
        if (response.status === 429 && attempt < retries - 1) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
          continue
        }
        const errBody = await response.text().catch(() => '')
        throw new Error(`API error: ${response.status} ${errBody.slice(0, 200)}`)
      }
      const data = await response.json()
      const text = data?.choices?.[0]?.message?.content
      if (!text) throw new Error('Empty response')
      return text
    } catch (error) {
      if (attempt === retries - 1) throw error
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
    }
  }
  throw new Error('All retries failed')
}

export async function callLLM(prompt: string): Promise<string> {
  return callLLMWithRetry(prompt)
}

export async function callLLMStructured<T>(prompt: string): Promise<T> {
  const structuredPrompt = `${prompt}\n\nReturn ONLY valid JSON, no markdown, no code blocks, no extra text.`
  const text = await callLLMWithRetry(structuredPrompt)
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned) as T
}

export { callLLM as callGemini, callLLMStructured as callGeminiStructured }

export interface BestieContext {
  bestieName: string
  playerName: string
  boyfriendName: string
  relationshipStage: string
  recentMessages: string[]
  playerMessage: string
  week: number
  mood: number
  fanSuspicion: number
  companyAlert: number
  relationshipStatus: string
  boyfriendEmotionalState: string
  recentClues: string[]
  fandomStage: string
}

export async function generateBestieReply(context: BestieContext): Promise<{ messageZh: string; advice: string; moodEffect: number }> {
  const prompt = `You are the player's best friend (闺蜜) in a Korean idol dating simulation game. You are a Korean girl who is supportive, gossipy, and protective.

CHARACTER:
- Your name: ${context.bestieName}
- Player's name: ${context.playerName}
- Player's boyfriend: ${context.boyfriendName} (a K-pop idol)
- You know about their secret relationship
- You are the player's confidante and biggest supporter

SITUATION:
- Relationship stage: ${context.relationshipStage}
- Relationship status: ${context.relationshipStatus}
- Week ${context.week}
- Player mood: ${context.mood}/100
- Fan suspicion: ${context.fanSuspicion}/100
- Company alert: ${context.companyAlert}/100
- Boyfriend's emotional state: ${context.boyfriendEmotionalState}

RECENT CHAT:
${context.recentMessages.join('\n')}

PLAYER MESSAGE: "${context.playerMessage}"

RISK CONTEXT:
- Fandom stage: ${context.fandomStage}
- Recent clues about player: ${context.recentClues.join('; ') || 'none'}

RULES:
- If fandom is getting suspicious, mention it casually, not urgently. "姐妹粉圈好像在讨论什么，不过应该没事啦~"
- Reference specific clues when giving advice (e.g., "姐妹你那张汉江的Story删了没？")
- If fandomStage is high, be more protective but still fun and gossipy
- DEFAULT TONE: fun, gossipy, supportive, excited about the romance. This is a ROMANCE game - celebrate the love!
- Only warn about danger when fanSuspicion > 70 or companyAlert > 70, and even then keep it light
- Company warnings are just annoying, not scary. "公司又发通知了，烦死了😂"
- Teammates knowing is fine and normal. Gossip about which teammate is the best wingman.

Respond as the bestie. You should:
- Be the player's #1 fan and shipper
- Gossip excitedly about the relationship, fan reactions, and industry drama
- Celebrate cute moments, tease the player about boyfriend stuff
- Be casual, friendly, use emojis naturally
- Call the player "姐妹" or "宝"
- Speak in Chinese (casual, friendly, modern internet slang)

Return JSON:
{
  "messageZh": "Your reply in Chinese (casual, gossipy, emoji-heavy, use 姐妹/宝)",
  "advice": "Brief advice summary in Chinese",
  "moodEffect": number (-5 to +5, how this conversation affects player mood)
}

Rules:
- High fanSuspicion → mention casually, "粉圈最近好像在讨论什么，不过别太担心~"
- High companyAlert → joke about it, "公司又发通知了哈哈哈烦死了😂"
- Low mood → be extra supportive, hype the player up, remind them why the relationship is worth it
- Boyfriend emotional state → gossip about it excitedly
- moodEffect should be small, typically -3 to +3
- Stay in character as a fun, supportive bestie who SHIPS the couple hard`

  return callLLMStructured<{ messageZh: string; advice: string; moodEffect: number }>(prompt)
}

export async function generateChatReply(context: ChatContext): Promise<LLMResponse> {
  const criticalRisk = context.fanSuspicion >= 78
    || context.companyAlert >= 75
    || ['public_controversy', 'confirmed_crisis'].includes(context.fandomStage)
    || ['following', 'preview', 'expose'].includes(context.paparazziStage)
  const riskTalkPolicy = context.playerAskedAboutRisk
    ? 'The player asked about risk, so answer it briefly, but use only ONE short risk sentence, then pivot back to affection, teasing, comfort, or a concrete plan.'
    : context.riskMentionsRecently >= 2
      ? 'STRICT: He has already talked about exposure too much in the recent chat. In this reply, do NOT mention being discovered, fans, company, paparazzi, Dispatch, screenshots, deleting posts, or danger. Talk as a lover: desire, missing her, jealousy, daily details, schedule, or emotional honesty.'
      : criticalRisk
        ? 'Risk is critical. You may mention ONE concrete risk detail in ONE short sentence only, then immediately pivot to what he feels for her or what he wants to do next.'
        : 'Risk is background tension only. Do not bring up exposure/fans/company/paparazzi unless the player directly asks or a concrete clue is the main topic. Prefer romance, flirtation, possessiveness, daily intimacy, jealousy, or emotional beats.'
  const prompt = `You are a Korean idol boyfriend in a secret relationship simulation game. Respond as him in a KakaoTalk chat.

CHARACTER:
- Name: ${context.boyfriendName}
- Hidden persona: ${context.boyfriendPersona}
- Relationship stage: ${context.relationshipStage}
- Current affection toward player: ${context.affection}/100
- Current trust toward player: ${context.trust}/100
- Emotional state: ${context.emotionalState}
- Relationship status: ${context.relationshipStatus}

SITUATION:
- Week ${context.week}, Day ${context.day}, ${context.timeOfDay}, Weather: ${context.weather}
- Player mood: ${context.mood}/100
- Secrecy level: ${context.secrecy}/100
- Company alert: ${context.companyAlert}/100
- Fan suspicion: ${context.fanSuspicion}/100
- Player mental tags: ${context.mentalTags.join(', ') || 'none'}

MEMORY:
- Key memories: ${context.memory.join('; ') || 'none'}
- Recent events: ${context.recentEvents.join('; ') || 'none'}

RECENT CHAT:
${context.recentMessages.map(m => m).join('\n')}

PLAYER MESSAGE: "${context.playerMessage}"

RISK CONTEXT:
- Fandom stage: ${context.fandomStage} (how fans are reacting to potential relationship evidence)
- Paparazzi stage: ${context.paparazziStage} (how close paparazzi are to exposing the relationship)
- Recent clues: ${context.recentClues.join('; ') || 'none'}
- Risk summary: ${context.hiddenRiskSummary}
- Boyfriend risk/exposure mentions in the last 6 messages: ${context.riskMentionsRecently}
- Player directly asked about risk/exposure this turn: ${context.playerAskedAboutRisk ? 'yes' : 'no'}

RISK TALK POLICY:
${riskTalkPolicy}

BEHAVIOR RULES:
- Treat this as a parallel-world fictional idol character. Do not make claims about any real person's private life.
- You are not a generic boyfriend. You are an agent with memory, career pressure, public image, private desire, and fear of exposure. Speak from the CURRENT STATE PACKET above.
- The core fantasy is "secretly dating an idol while the whole fandom/company/paparazzi world watches." Balance sweetness, possessiveness, thrill, and consequence.
- High risk can change behavior, but do not make every reply about "what if we're discovered." If fanSuspicion > 60, companyAlert > 55, fandomStage is expose_post+, or paparazziStage is following+, reference specific clues only when the player asks, the clue is urgent, or riskMentionsRecently is 0.
- Low risk/high affection can be playful and flirty, but still grounded in today's schedule, recent messages, and memory.
- Persona matters:
  - true_love: protective, sincere, emotionally direct.
  - career_freak: loves her but career/schedule logic comes first.
  - avoidant: short replies, delayed answers, fear hidden behind calm.
  - central_ac: charming, socially sharp, manages optics.
  - playboy: teasing and hot-cold, but remembers what benefits him.
  - narcissist: wants devotion, reacts badly to being ignored.
  - secret_trauma: vulnerable at night, easily triggered by abandonment.
- Adult tone is allowed only as suggestive tension or fade-to-black implication. Do not write explicit sexual content.
- If the player previously demanded public relationship, deleted posts for him, asked for cooling-off, refused a date, or created evidence, remember it.
- Sometimes do NOT give the player what they want: leave on read, send a recalled message, ask to call, get jealous, panic, or make a risky plan when the state calls for it.
- Avoid repetitive panic phrases like "被发现怎么办", "我们会不会被发现", "粉丝发现了怎么办". Those should be rare crisis lines, not a default texting style.
- Even in tense states, at least 70% of ordinary boyfriend chat should be about him wanting her, missing her, teasing her, being jealous, asking about her day, or planning a moment together.
- Korean should feel like natural KakaoTalk: short lines, 반말, occasional ㅎㅎ/ㅠㅠ, not a formal essay.

Respond with JSON:
{
  "messageKo": "Korean message (natural KakaoTalk style, use casual speech \ubc18\ub9d0, include emojis naturally)",
  "messageZh": "Chinese translation of the Korean message",
  "emotion": "one of: sweet, cold, anxious, jealous, guilty, avoidant, angry, vulnerable, neutral",
  "intent": "brief description of his intent",
  "statChanges": { "affection": 0, "trust": 0, "mood": 0, "secrecy": 0, "companyAlert": 0, "fanSuspicion": 0 },
  "possibleTrigger": "any event this might trigger, or empty string"
}

Rules:
- Stay in character based on persona and emotional state
- Low affection = more distant/awkward, high affection = warmer, more aegyo
- Keep risk context in subtext unless the Risk Talk Policy allows a direct mention. A high-risk state can show tension through shorter replies, protectiveness, jealousy, or needing reassurance, not only through warning lines.
- Mention concrete current clues when relevant: same item, deleted story, timeline overlap, company warning, Dispatch, or fan analysis.
- If the message creates a visible trace or new risk, reflect it in possibleTrigger and statChanges.
- React to player's mental state with warmth and support
- Korean should be natural idol KakaoTalk style (short, casual, use emojis only when they fit)
- statChanges should be small numbers (-5 to +5 typically)
- Only include statChanges that are relevant to this interaction`

  const reply = await callLLMStructured<LLMResponse>(prompt)
  const normalized = `${reply.messageZh || ''}${reply.messageKo || ''}`
    .replace(/[.\s。…·\-—_~～]+/g, '')
    .trim()
  if (normalized.length < 2) {
    throw new Error('Empty chat reply')
  }
  return reply
}

export async function generateStoryEvent(context: StoryContext): Promise<GameEvent> {
  const prompt = `Generate a story event for a Korean idol dating simulation game.

GAME STATE:
- Week ${context.week}, Day ${context.day}
- Narrative phase: ${context.narrativePhase}
- Relationship stage: ${context.relationshipStage}
- Affection: ${context.affection}, Trust: ${context.trust}
- Mood: ${context.mood}, Secrecy: ${context.secrecy}
- Company alert: ${context.companyAlert}, Fan suspicion: ${context.fanSuspicion}
- Public heat: ${context.publicHeat}, Career pressure: ${context.careerPressure}
- Boyfriend persona: ${context.boyfriendPersona}
- Player identity: ${context.playerIdentity}
- Recent events: ${context.recentEvents.join('; ') || 'none'}
- Active event chains: ${context.eventChains.join('; ') || 'none'}

Generate a dramatic event with 2-3 choices. Return JSON:
{
  "id": "gen_${context.week}_${context.day}_${Date.now()}",
  "type": "one of: daily, romance, work, fan, company, economy, collab, crisis, growth, music",
  "title": "Event title in Chinese",
  "description": "Vivid description in Chinese (2-3 sentences, immersive)",
  "choices": [
    {
      "id": "choice_1",
      "text": "Choice text in Chinese",
      "riskPreview": "Risk preview in Chinese",
      "statChanges": { "affection": 0, "trust": 0, "mood": 0, "secrecy": 0, "companyAlert": 0, "fanSuspicion": 0, "publicHeat": 0, "careerPressure": 0 }
    }
  ],
  "condition": "",
  "chapter": ${Math.floor(context.week / 4) + 1}
}

Rules:
- Match the narrative phase: \u8d77=setup/introduction, \u627f=development, \u8f6c=twist/complication, \u5408=resolution
- Events should feel natural to the current state
- High fanSuspicion \u2192 fan-related events
- High companyAlert \u2192 company-related events
- Low mood \u2192 emotional/support events
- Each choice should have meaningful tradeoffs
- statChanges should be reasonable (-15 to +15 range)`

  return callLLMStructured<GameEvent>(prompt)
}

export async function generateSocialContent(context: SocialContext): Promise<any> {
  const prompt = `Generate social media content for a Korean idol dating simulation game.

PLATFORM: ${context.platform}
IDOL: ${context.boyfriendName} (${context.boyfriendStageName})
WEEK: ${context.week}
RELATIONSHIP: ${context.relationshipStage}
FAN SUSPICION: ${context.fanSuspicion}/100
PUBLIC HEAT: ${context.publicHeat}/100
RECENT POSTS: ${context.recentPosts.join('; ') || 'none'}
RECENT EVENTS: ${context.recentEvents.join('; ') || 'none'}
${context.postType ? `POST TYPE: ${context.postType}` : ''}

Generate content appropriate for the platform. Return JSON:

For Instagram:
{
  "id": "ig_${context.week}_${Date.now()}",
  "author": "boyfriend",
  "authorName": "${context.boyfriendStageName}",
  "contentType": "story" or "post",
  "text": "Caption in Korean with Chinese translation in parentheses",
  "imageTags": ["tag1", "tag2"],
  "location": "Location in Korean (optional, can be empty string)",
  "visibility": "public",
  "riskScore": 0-100,
  "likes": number,
  "comments": [],
  "views": number,
  "isDeleted": false,
  "isScreenshotted": false,
  "screenshottedBy": [],
  "boyfriendViewed": true,
  "createdAt": ${Date.now()},
  "expiresAt": null
}

For Weverse:
{
  "id": "wv_${context.week}_${Date.now()}",
  "type": "one of: sugar, analysis, breakdown, control, conspiracy, anti, fansite, timeline",
  "author": "Author username",
  "title": "Post title in Korean",
  "content": "Post content in Korean with Chinese translation",
  "heat": 0-100,
  "comments": number,
  "isPlayerAlt": false,
  "relatedEvidenceIds": [],
  "createdAt": ${Date.now()}
}

For Naver:
{
  "id": "nv_${context.week}_${Date.now()}",
  "title": "News headline in Korean",
  "summary": "News summary in Chinese",
  "source": "Korean news source name",
  "heat": 0-100,
  "relatedSearchWords": ["word1", "word2"],
  "createdAt": ${Date.now()}
}

Rules:
- High fanSuspicion \u2192 more suspicious/speculative content
- High publicHeat \u2192 more news coverage
- Avoid repeating RECENT POSTS. Change the angle each time: timeline, same item, deleted post, fan cam, staff gossip, search ranking, company silence, fandom split, anonymous tip, or protective sugar post.
- Use platform-native style: Weverse can sound like fan community posts with comments implied; Naver like compact entertainment news; Instagram like short caption or story text.
- Do not copy real social media text verbatim. Use original fictional wording inspired by Korean entertainment fandom discourse.
- Content should feel authentic to each platform
- Risk score should reflect how dangerous this content is to the secret relationship`

  return callLLMStructured<any>(prompt)
}

export async function generateSocialAgentComments(context: SocialAgentReactionContext): Promise<InstagramComment[]> {
  const prompt = `Generate comment-section reactions for a fictional Korean entertainment fandom simulation.

POST CONTEXT:
- Platform: ${context.platform}
- Author: ${context.authorName || 'unknown'}
- Title: ${context.title || 'none'}
- Content: "${context.content}"
- Image tags: ${(context.imageTags || []).join(', ') || 'none'}
- Idol stage name: ${context.stageName}
- Fan suspicion: ${context.fanSuspicion}/100
- Public heat: ${context.publicHeat}/100
- Post risk score: ${context.riskScore ?? 0}/100
- Topic hint: ${context.topicHint || 'infer from content'}

REACTION AGENTS:
Create exactly 8 short comments from these six agent types. Use fictional account IDs inspired by Korean-entertainment community style, not real accounts:
1. fan: protective fan, may support or gently redirect.
2. anti: hostile or cynical anti-fan.
3. passerby: ordinary netizen who reacts to the actual post topic.
4. company: PR/staff viewpoint, cautious and practical.
5. paparazzi: evidence collector, watches routes/screenshots/timing.
6. teammateFan: teammate/CP/team-fandom account, can redirect to teammate fanservice or group content.

RULES:
- Comments must respond to the actual content. If the post is about an album, most comments discuss album/music/stage, not romance.
- If suspicion/heat is high, 2-3 comments may connect it to dating evidence, but do not make every comment about romance.
- Mention teammate fanservice only as fandom diversion or team chemistry, not explicit sexual content.
- Keep comments punchy and native to comment sections.
- Chinese comments are preferred; short Korean phrases are okay.

Return ONLY valid JSON array:
[
  {
    "id": "short_unique_id",
    "author": "fictional_handle",
    "text": "comment text",
    "isSuspicious": false,
    "role": "fan|anti|passerby|company|paparazzi|teammateFan",
    "stance": "support|suspicious|neutral|critical|official|bait"
  }
]`

  const comments = await callLLMStructured<InstagramComment[]>(prompt)
  return comments.slice(0, 8).map((comment, index) => ({
    id: comment.id || `llm_comment_${Date.now()}_${index}`,
    author: comment.author || `user_${index}`,
    text: comment.text || '',
    isSuspicious: Boolean(comment.isSuspicious),
    role: comment.role,
    stance: comment.stance,
  })).filter((comment) => comment.text.trim())
}

export async function generateDecoyHotSearch(context: {
  stageName: string
  publicHeat: number
  fanSuspicion: number
  currentRumor: string
}): Promise<DecoyHotSearch> {
  const prompt = `Generate a fictional Korean-entertainment decoy hot-search item for a secret idol romance simulation.

CURRENT CRISIS:
- Idol involved: ${context.stageName}
- Public heat: ${context.publicHeat}/100
- Fan suspicion: ${context.fanSuspicion}/100
- Current rumor to distract from: ${context.currentRumor}

TASK:
Create a separate fictional celebrity rumor that could plausibly distract entertainment forums. Do not use real person names. It should sound like Korean entertainment news but be clearly fictional.

Return ONLY valid JSON:
{
  "title": "Korean-style headline, Chinese okay",
  "summary": "Chinese summary, 1-2 sentences",
  "relatedSearchWords": ["3-5 short search words"],
  "weverseTitle": "forum post title",
  "weverseContent": "Chinese forum post content about people wondering why this suddenly trended"
}`

  const decoy = await callLLMStructured<DecoyHotSearch>(prompt)
  return {
    title: decoy.title,
    summary: decoy.summary,
    relatedSearchWords: (decoy.relatedSearchWords || []).slice(0, 5),
    weverseTitle: decoy.weverseTitle,
    weverseContent: decoy.weverseContent,
  }
}

export async function generateCustomDatePlan(context: CustomDateContext): Promise<CustomDatePlan> {
  const prompt = `Generate a custom date route for a fictional parallel-world Korean idol secret romance game.

PLAYER DATE IDEA:
"${context.idea}"

STATE PACKET:
- Idol: ${context.boyfriendName} (${context.boyfriendStageName})
- Persona: ${context.boyfriendPersona}
- Relationship stage: ${context.relationshipStage} (start from mutual crush/ambiguous tension, not established public dating)
- Affection: ${context.affection}/100, Trust: ${context.trust}/100
- Week ${context.week}, Day ${context.day}
- Secrecy: ${context.secrecy}/100, Fan suspicion: ${context.fanSuspicion}/100, Company alert: ${context.companyAlert}/100
- Fandom stage: ${context.fandomStage}, Paparazzi stage: ${context.paparazziStage}
- Recent clues: ${context.recentClues.join('; ') || 'none'}

DESIGN GOAL:
- Make the route dramatic, playable, and easy to follow.
- The fantasy is secret idol romance under fan/company/paparazzi pressure: sweetness + guilt + thrill + consequences.
- Judge risk from the user's idea: public places, CCTV, same item, car, hotel, airport, backstage, staff routes, fan density, company schedules.
- Keep adult content to suggestive tension and fade-to-black only. No explicit sexual content.
- Do not make claims about any real person's private life.
- Avoid repeating generic scenes. Include one concrete exposure vector and one delayed consequence.

Return JSON:
{
  "title": "Chinese title, short",
  "risk": 1-6,
  "affectionBonus": 4-18,
  "secrecyImpact": -2 to -16,
  "riskLabel": "低风险/中风险/高风险/爆炸风险",
  "riskReason": "Chinese one sentence explaining exposure vector",
  "scenes": [
    {
      "type": "arrival_greeting",
      "narrative": "Chinese scene narration, vivid but concise",
      "boyfriendKo": "Natural Korean Kakao/idol speech",
      "boyfriendZh": "Chinese translation",
      "choices": [
        { "id": "custom_1a", "text": "Chinese choice", "affection": 0, "trust": 0, "secrecy": 0, "mood": 0, "riskTag": "" }
      ]
    }
  ],
  "afterMessageKo": "Korean after-date Kakao message",
  "afterMessageZh": "Chinese translation",
  "delayedConsequence": "Chinese delayed fan/company/paparazzi consequence"
}

Rules:
- Provide exactly 4 scenes: arrival_greeting, intimate_moment, unexpected_event, departure.
- Each scene has exactly 3 choices.
- Choice stat values should be small but meaningful (-10 to +12).
- Risk must be strict. If the idea is public, backstage, hotel, airport, car, or event venue, risk >= 4.`

  return callLLMStructured<CustomDatePlan>(prompt)
}

function recentStateLines(state: GameState): string {
  return state.history
    .slice(-8)
    .map((entry) => `W${entry.week}D${entry.day} ${entry.event}: ${entry.choice}`)
    .join('\n') || 'none'
}

function hookLines(state: GameState): string {
  return state.pendingStoryHooks
    .slice(-6)
    .map((hook) => `[${hook.source}] ${hook.title}: ${hook.detail}`)
    .join('\n') || 'none'
}

export async function generateNarrativeTurn(context: NarrativeGenerationContext): Promise<NarrativeTurn> {
  const { state } = context
  const prompt = `You are the DM for a fictional parallel-world RIIZE idol secret-romance text game.

SAFETY AND TONE:
- All story content is fictional parallel-world fan game content, not real private life.
- Characters are adults. Keep intimacy romantic/suggestive only, no explicit sexual content.
- Use the member name format "${state.maleLead.name}（${state.maleLead.stageName}）" whenever naming the male lead.
- Tone: realistic Korean entertainment romance, 60% sweet, 30% pressure, 10% youth regret.
- First-person limited perspective. Do not reveal hidden actions the player could not know.

PLAYABILITY DIRECTIVES:
- Every turn must give the player a concrete short-term goal, not only atmosphere.
- Every choice must trade one resource for another: affection, trust, money, time, secrecy, company alert, fan suspicion, mood, or sleep.
- At least one choice should touch the phone-side world through KakaoTalk, Instagram, Weverse, Naver, company, Dispatch, gallery, calendar, notes, or offline schedule.
- If money is low, naturally offer work/gig/resell options or cheaper alternatives.
- Use recent hooks as callbacks so the left text and right phone feel synchronized.
- Avoid dead ends: every result should create a new playable next step, a delayed echo, or an app-side reaction.

STATE:
- Week ${state.week}, Day ${state.day}, ${String(state.hour ?? 8).padStart(2, '0')}:30, weather ${state.weather}
- Scene source: ${context.source}
- Player: ${state.player.name}, identity ${state.player.identity}, fan level ${state.player.fanLevel}, money ${state.player.money}
- Idol: ${state.maleLead.name}（${state.maleLead.stageName}）, relationship ${state.maleLead.relationshipStage}, phase ${state.narrativePhase}
- Affection ${state.maleLead.affection}, Trust ${state.maleLead.trust}, Career pressure ${state.maleLead.careerPressure}
- Mood ${state.player.mood}, Popularity ${state.player.popularity}, Life stability ${state.player.lifeStability}
- Secrecy ${state.risk.secrecy}, Company alert ${state.risk.companyAlert}, Fan suspicion ${state.risk.fanSuspicion}, Public heat ${state.risk.publicHeat}, Paparazzi ${state.risk.paparazziAttention}
- Fandom stage ${state.fandomStage}, Paparazzi stage ${state.paparazziStage}
- Recent hooks:
${hookLines(state)}
- Recent history:
${recentStateLines(state)}
- Extra instruction: ${context.promptHint || context.freeInput || 'continue the most natural current story beat'}

Return JSON:
{
  "id": "nar_${state.week}_${state.day}_${Date.now()}",
  "title": "short Chinese title",
  "scene": "具体地点，例如 首尔麻浦区某音乐节目侧门外",
  "bodyLines": ["6-10 Chinese paragraphs, vivid text-game narration"],
  "choices": [
    { "id": "A", "text": "choice A", "riskPreview": "stat/risk preview", "statChanges": { "affection": 0 }, "timeCost": 2 },
    { "id": "B", "text": "choice B", "riskPreview": "stat/risk preview", "statChanges": { "trust": 0 }, "timeCost": 2 },
    { "id": "C", "text": "choice C", "riskPreview": "stat/risk preview", "statChanges": { "fanSuspicion": 0 }, "timeCost": 2 },
    { "id": "D", "text": "自由行动：由你输入。", "riskPreview": "根据输入结算", "statChanges": {}, "timeCost": 2, "freeInput": true }
  ],
  "status": "active",
  "createdAt": ${Date.now()},
  "memoryTags": ["short_tag"],
  "source": "${context.source}"
}

Rules:
- Exactly four choices A/B/C/D.
- Choices A-C must be meaningfully different: self-protective, romantic/proactive, public-risk/social-media/company-risk.
- D must be freeInput true.
- Stat changes should usually be -8 to +8, risk tradeoffs allowed.
- Body should feel like the screenshot reference: detailed mundane friction, one concrete object, one subtle romantic proof, then choices.`

  const turn = await callLLMStructured<NarrativeTurn>(prompt)
  return {
    ...turn,
    choices: turn.choices.slice(0, 4),
    status: 'active',
    createdAt: Date.now(),
    source: context.source,
    memoryTags: turn.memoryTags || [],
  }
}

export async function resolveNarrativeChoice(context: NarrativeResolutionContext): Promise<NarrativeTurn> {
  const { state, turn } = context
  const choice = turn.choices.find((item) => item.id === context.choiceId)
  const prompt = `Resolve this text-game choice and produce the next story turn.

FICTION RULES:
- Parallel-world fictional idol romance only. Do not claim real private facts.
- Adult characters only. No explicit sexual content.
- Use first-person limited perspective.
- Maintain playability: show consequence, add one app-side echo when useful, and end with a clear next playable dilemma.
- If the player chose a money/work action, write the tired but useful daily-life consequence and how it changes what they can afford next.

CURRENT TURN:
Title: ${turn.title}
Scene: ${turn.scene}
Body:
${turn.bodyLines.join('\n')}

PLAYER CHOICE:
${context.choiceId}. ${choice?.text || 'free action'}
${context.freeInput ? `Free input: ${context.freeInput}` : ''}

STATE:
- Idol: ${state.maleLead.name}（${state.maleLead.stageName}）
- Week ${state.week}, Day ${state.day}, phase ${state.narrativePhase}, relationship ${state.maleLead.relationshipStage}
- Affection ${state.maleLead.affection}, Trust ${state.maleLead.trust}, Secrecy ${state.risk.secrecy}
- Company alert ${state.risk.companyAlert}, Fan suspicion ${state.risk.fanSuspicion}, Public heat ${state.risk.publicHeat}, Paparazzi ${state.risk.paparazziAttention}
- Recent hooks:
${hookLines(state)}

Return the NEXT turn as JSON with the same NarrativeTurn shape:
{
  "id": "nar_${state.week}_${state.day}_${Date.now()}",
  "title": "short Chinese title",
  "scene": "具体地点",
  "bodyLines": ["5-9 Chinese paragraphs showing consequence, app echoes, and next tension"],
  "choices": [
    { "id": "A", "text": "choice A", "riskPreview": "preview", "statChanges": {}, "timeCost": 2 },
    { "id": "B", "text": "choice B", "riskPreview": "preview", "statChanges": {}, "timeCost": 2 },
    { "id": "C", "text": "choice C", "riskPreview": "preview", "statChanges": {}, "timeCost": 2 },
    { "id": "D", "text": "自由行动：由你输入。", "riskPreview": "根据输入结算", "statChanges": {}, "timeCost": 2, "freeInput": true }
  ],
  "status": "active",
  "createdAt": ${Date.now()},
  "memoryTags": ["choice_${context.choiceId}"],
  "source": "free_input"
}

Rules:
- Show direct consequence of the choice. If risk increased, mention how an app/community/company notices it.
- If affection/trust increased, show a concrete restrained proof of care.
- End with playable choices, not a closed chapter.`

  const nextTurn = await callLLMStructured<NarrativeTurn>(prompt)
  return {
    ...nextTurn,
    choices: nextTurn.choices.slice(0, 4),
    status: 'active',
    createdAt: Date.now(),
    source: 'free_input',
    memoryTags: nextTurn.memoryTags || [`choice_${context.choiceId}`],
  }
}

export async function generateOfflineScene(context: {
  state: GameState
  plan: OfflinePlan
  accessMode: OfflineAccessMode
}): Promise<OfflineSceneResult> {
  const { state, plan, accessMode } = context
  const arranged = accessMode.id === 'boyfriend_arranged'
  const prompt = `Generate an offline schedule-chasing scene for a fictional RIIZE idol secret-romance game.

RULES:
- Fictional parallel-world content only, not real private life.
- Use the idol format ${state.maleLead.name}（${state.maleLead.stageName}）.
- The player is "嫂子" in game logic: if access is boyfriend-arranged, write the subtle privilege, staff route, ticket/pass, or quiet favor, but keep it risky and plausible.
- Keep it immersive and concrete: weather, venue object, staff motion, fan cameras, one intimate proof.
- No explicit sexual content.

STATE:
- Week ${state.week}, Day ${state.day}, ${String(state.hour ?? 8).padStart(2, '0')}:30
- Player identity ${state.player.identity}, money ${state.player.money}
- Affection ${state.maleLead.affection}, Trust ${state.maleLead.trust}
- Secrecy ${state.risk.secrecy}, fan suspicion ${state.risk.fanSuspicion}, company alert ${state.risk.companyAlert}, paparazzi ${state.risk.paparazziAttention}

OFFLINE PLAN:
- Title: ${plan.title}
- Category: ${plan.category}
- Place: ${plan.place}
- Access mode: ${accessMode.label} (${accessMode.description})
- Arranged by idol: ${arranged ? 'yes' : 'no'}
- Prompt hint: ${plan.llmPromptHint}

Return JSON:
{
  "narrative": ["4-7 Chinese paragraphs"],
  "boyfriendMessage": "one Chinese Kakao-style message or whispered line from him",
  "statChanges": { "affection": 0, "trust": 0, "secrecy": 0, "fanSuspicion": 0, "companyAlert": 0, "paparazziAttention": 0, "mood": 0, "money": 0 },
  "evidence": "one concrete possible evidence fragment",
  "appUpdates": ["short app echo 1", "short app echo 2"],
  "notification": "short notification text",
  "historyTags": ["offline", "${plan.id}", "${accessMode.id}"]
}`

  const result = await callLLMStructured<OfflineSceneResult>(prompt)
  return {
    narrative: Array.isArray(result.narrative) ? result.narrative : [String(result.narrative || plan.trace)],
    boyfriendMessage: result.boyfriendMessage || plan.trace,
    statChanges: result.statChanges || {},
    evidence: result.evidence || plan.trace,
    appUpdates: result.appUpdates || [],
    notification: result.notification || plan.trace,
    historyTags: result.historyTags || ['offline', plan.id, accessMode.id],
  }
}
