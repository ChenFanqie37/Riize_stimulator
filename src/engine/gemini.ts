import type { LLMResponse, GameEvent, GameState, EmotionLabel } from '../types/game'
import { useSettingsStore } from '../store/settingsStore'

let keyIndex = 0

function getRuntimeConfig() {
  const state = useSettingsStore.getState()
  return {
    keys: state.apiKeys.length > 0 ? state.apiKeys : ['YOUR_API_KEY_HERE'],
    baseUrl: state.apiBaseUrl || 'https://api.deepseek.com',
    model: state.apiModel || 'deepseek-chat',
  }
}

function getNextKey(): string {
  const config = getRuntimeConfig()
  const key = config.keys[keyIndex % config.keys.length]
  keyIndex++
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

async function callLLMWithRetry(prompt: string, retries: number = 3): Promise<string> {
  const config = getRuntimeConfig()
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const key = getNextKey()
      const url = `${config.baseUrl}/chat/completions`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.9,
          top_p: 0.95,
          max_tokens: 2048
        })
      })
      if (!response.ok) {
        if (response.status === 429 && attempt < retries - 1) {
          await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
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
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
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

BEHAVIOR RULES:
- Treat this as a parallel-world fictional idol character. Do not make claims about any real person's private life.
- You are not a generic boyfriend. You are an agent with memory, career pressure, public image, private desire, and fear of exposure. Speak from the CURRENT STATE PACKET above.
- The core fantasy is "secretly dating an idol while the whole fandom/company/paparazzi world watches." Balance sweetness, possessiveness, thrill, and consequence.
- High risk must change behavior: if fanSuspicion > 60, companyAlert > 55, fandomStage is expose_post+, or paparazziStage is following+, reference specific clues, ask for caution, recall deleted posts, or avoid obvious contact.
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
- Do not ignore risk context. A high-risk state should feel tense, even when he is sweet.
- Mention concrete current clues when relevant: same item, deleted story, timeline overlap, company warning, Dispatch, or fan analysis.
- If the message creates a visible trace or new risk, reflect it in possibleTrigger and statChanges.
- React to player's mental state with warmth and support
- Korean should be natural idol KakaoTalk style (short, casual, use emojis only when they fit)
- statChanges should be small numbers (-5 to +5 typically)
- Only include statChanges that are relevant to this interaction`

  return callLLMStructured<LLMResponse>(prompt)
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
