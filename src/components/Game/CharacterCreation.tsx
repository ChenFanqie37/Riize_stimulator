import { useState } from 'react'
import { ChevronLeft, ChevronRight, User, Sparkles } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { riizeMembers } from '@/data/characters'
import { identities } from '@/data/identities'
import type { PlayerIdentity, RIIZEMember, FanLevel, StoryPace, PlotPreference } from '@/types/game'

const fanLevelOptions: { value: FanLevel; label: string; desc: string }[] = [
  { value: 'hard_fan', label: '死忠粉', desc: '追过每一场，投过每一票' },
  { value: 'casual', label: '路人粉', desc: '有好感，偶尔关注' },
  { value: 'neutral', label: '中立', desc: '不追星，偶然相遇' },
  { value: 'returning', label: '回坑粉', desc: '曾经追过，最近回归' },
  { value: 'solo_stan', label: '唯粉', desc: '只关注一个人' },
]

const storyPaceOptions: { value: StoryPace; label: string; desc: string }[] = [
  { value: 'slow_burn', label: '慢热', desc: '细水长流，日久生情' },
  { value: 'standard', label: '标准', desc: '节奏适中，有张有弛' },
  { value: 'high_pressure', label: '高压', desc: '危机四伏，步步惊心' },
  { value: 'growth', label: '成长', desc: '共同成长，互相成就' },
  { value: 'ensemble', label: '群像', desc: '多条线索，群戏为主' },
]

const plotPreferenceOptions: { value: PlotPreference; label: string; desc: string }[] = [
  { value: 'A', label: 'A线·甜蜜日常', desc: '主打恋爱甜度，日常互动为主' },
  { value: 'B', label: 'B线·暗流涌动', desc: '主打悬疑推理，隐藏线索多' },
  { value: 'C', label: 'C线·狗血修罗', desc: '主打情感冲突，修罗场频发' },
  { value: 'D', label: 'D线·现实残酷', desc: '主打现实压力，生存挑战' },
]

const personaLabels: Record<string, string> = {
  true_love: '真爱型',
  career_freak: '事业狂',
  avoidant: '回避型',
  central_ac: '中央空调',
  playboy: '花花公子',
  narcissist: '自恋型',
  secret_trauma: '隐伤型',
}

export default function CharacterCreation() {
  const createGame = useGameStore((s) => s.createGame)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [bestieName, setBestieName] = useState('智恩')
  const [age, setAge] = useState(22)
  const [identity, setIdentity] = useState<PlayerIdentity | null>(null)
  const [memberId, setMemberId] = useState<RIIZEMember | null>(null)
  const [customBoyfriendName, setCustomBoyfriendName] = useState('')
  const [fanLevel, setFanLevel] = useState<FanLevel>('casual')
  const [storyPace, setStoryPace] = useState<StoryPace>('standard')
  const [plotPreference, setPlotPreference] = useState<PlotPreference>('A')

  const canNext = () => {
    switch (step) {
      case 0: return name.trim().length > 0 && age >= 18 && age <= 35
      case 1: return identity !== null
      case 2: return memberId !== null
      case 3: return true
      default: return false
    }
  }

  const handleConfirm = () => {
    if (!identity || !memberId) return
    createGame({
      playerName: name.trim(),
      bestieName: bestieName.trim() || '智恩',
      playerAge: age,
      identity,
      fanLevel,
      storyPace,
      plotPreference,
      memberId,
      customBoyfriendName: customBoyfriendName.trim() || undefined,
    })
  }

  const stepLabels = ['玩家信息', '选择身份', '选择男主', '游戏设置']

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        background: '#F2F2F7',
      }}
    >
      <div className="flex items-center justify-center gap-3 py-6">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{
                background: i <= step ? '#007AFF' : 'rgba(0,0,0,0.08)',
                boxShadow: i <= step ? '0 0 8px rgba(0,122,255,0.3)' : 'none',
              }}
            />
            <span
              className="text-xs"
              style={{ color: i <= step ? 'rgba(28,28,30,0.8)' : 'rgba(28,28,30,0.25)' }}
            >
              {label}
            </span>
            {i < stepLabels.length - 1 && (
              <div
                className="w-8 h-px"
                style={{ background: i < step ? 'rgba(0,122,255,0.3)' : 'rgba(0,0,0,0.08)' }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {step === 0 && (
          <div className="max-w-md mx-auto flex flex-col gap-6 pt-4" style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div className="flex items-center gap-3 mb-2">
              <User size={20} style={{ color: '#007AFF' }} />
              <h2 className="text-[#1C1C1E] text-xl font-bold">玩家信息</h2>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#8E8E93] text-sm">你的名字</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入你的名字..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-black/8 text-[#1C1C1E] placeholder-[#8E8E93]/40 outline-none focus:border-[#007AFF]/50 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#8E8E93] text-sm">闺蜜的名字</label>
              <input
                type="text"
                value={bestieName}
                onChange={(e) => setBestieName(e.target.value)}
                placeholder="输入闺蜜名字（默认：智恩）"
                className="w-full px-4 py-3 rounded-xl bg-white border border-black/8 text-[#1C1C1E] placeholder-[#8E8E93]/40 outline-none focus:border-[#007AFF]/50 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#8E8E93] text-sm">年龄</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                min={18}
                max={35}
                className="w-full px-4 py-3 rounded-xl bg-white border border-black/8 text-[#1C1C1E] outline-none focus:border-[#007AFF]/50 transition-colors"
              />
              <p className="text-[#8E8E93]/60 text-xs">年龄范围：18-35岁</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="pt-4" style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={20} style={{ color: '#007AFF' }} />
              <h2 className="text-[#1C1C1E] text-xl font-bold">选择身份</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
              {identities.map((id) => (
                <button
                  key={id.id}
                  onClick={() => setIdentity(id.id)}
                  className="text-left p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: identity === id.id ? 'rgba(0,122,255,0.08)' : '#FFFFFF',
                    border: identity === id.id ? '2px solid #007AFF' : '2px solid rgba(0,0,0,0.06)',
                    boxShadow: identity === id.id ? '0 2px 12px rgba(0,122,255,0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <p className="text-[#1C1C1E] font-bold text-sm mb-1">{id.nameZh}</p>
                  <p className="text-[#8E8E93]/60 text-xs mb-2 line-clamp-2">{id.description}</p>
                  <div className="flex flex-col gap-1">
                    <p className="text-green-600/70 text-[10px]">✦ {id.advantages[0]}</p>
                    <p className="text-red-500/70 text-[10px]">✧ {id.disadvantages[0]}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="pt-4" style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">💕</span>
              <h2 className="text-[#1C1C1E] text-xl font-bold">选择男主</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
              {riizeMembers.map((m) => (
                <button
                  key={m.memberId}
                  onClick={() => {
                    setMemberId(m.memberId)
                    if (!customBoyfriendName) setCustomBoyfriendName('')
                  }}
                  className="text-left p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: memberId === m.memberId ? 'rgba(0,122,255,0.08)' : '#FFFFFF',
                    border: memberId === m.memberId ? '2px solid #007AFF' : '2px solid rgba(0,0,0,0.06)',
                    boxShadow: memberId === m.memberId ? '0 2px 12px rgba(0,122,255,0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="text-3xl mb-2">{m.emoji}</div>
                  <p className="text-[#1C1C1E] font-bold text-sm">{m.nameZh}</p>
                  <p className="text-[#5AC8FA] text-xs">{m.stageName}</p>
                  <p className="text-[#8E8E93]/60 text-[10px] mt-1">{m.position}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.hiddenPersonaPool.map((p) => (
                      <span
                        key={p}
                        className="px-1.5 py-0.5 rounded text-[9px]"
                        style={{ background: 'rgba(0,122,255,0.08)', color: '#5AC8FA' }}
                      >
                        {personaLabels[p]}
                      </span>
                    ))}
                  </div>
                  <p className="text-[#8E8E93]/40 text-[10px] mt-2 line-clamp-2">{m.persona.slice(0, 40)}...</p>
                </button>
              ))}
            </div>
            {memberId && (
              <div className="mt-4 max-w-sm mx-auto" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <p className="text-[#8E8E93] text-xs mb-2">自定义他在游戏里的称呼（留空则使用原名）</p>
                <input
                  type="text"
                  value={customBoyfriendName}
                  onChange={(e) => setCustomBoyfriendName(e.target.value)}
                  placeholder={riizeMembers.find(m => m.memberId === memberId)?.nameZh || ''}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid rgba(0,0,0,0.08)',
                    color: '#1C1C1E',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#007AFF' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.08)' }}
                />
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="max-w-md mx-auto flex flex-col gap-8 pt-4" style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div className="flex flex-col gap-3">
              <h3 className="text-[#1C1C1E] font-bold text-sm">粉丝等级</h3>
              <div className="flex flex-wrap gap-2">
                {fanLevelOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFanLevel(opt.value)}
                    className="px-4 py-2 rounded-xl text-xs transition-all duration-200"
                    style={{
                      background: fanLevel === opt.value ? 'rgba(0,122,255,0.12)' : 'rgba(0,0,0,0.03)',
                      border: fanLevel === opt.value ? '1px solid #007AFF' : '1px solid rgba(0,0,0,0.08)',
                      color: fanLevel === opt.value ? '#007AFF' : 'rgba(28,28,30,0.5)',
                    }}
                  >
                    <p className="font-bold">{opt.label}</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-[#1C1C1E] font-bold text-sm">故事节奏</h3>
              <div className="flex flex-wrap gap-2">
                {storyPaceOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStoryPace(opt.value)}
                    className="px-4 py-2 rounded-xl text-xs transition-all duration-200"
                    style={{
                      background: storyPace === opt.value ? 'rgba(0,122,255,0.08)' : 'rgba(0,0,0,0.03)',
                      border: storyPace === opt.value ? '1px solid #007AFF' : '1px solid rgba(0,0,0,0.08)',
                      color: storyPace === opt.value ? '#5AC8FA' : 'rgba(28,28,30,0.5)',
                    }}
                  >
                    <p className="font-bold">{opt.label}</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-[#1C1C1E] font-bold text-sm">剧情偏好</h3>
              <div className="flex flex-wrap gap-2">
                {plotPreferenceOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPlotPreference(opt.value)}
                    className="px-4 py-2 rounded-xl text-xs transition-all duration-200"
                    style={{
                      background: plotPreference === opt.value ? 'rgba(175,82,222,0.08)' : 'rgba(0,0,0,0.03)',
                      border: plotPreference === opt.value ? '1px solid #AF52DE' : '1px solid rgba(0,0,0,0.08)',
                      color: plotPreference === opt.value ? '#AF52DE' : 'rgba(28,28,30,0.5)',
                    }}
                  >
                    <p className="font-bold">{opt.label}</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-6 py-5 border-t border-black/5">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-20"
          style={{
            background: 'rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.08)',
            color: 'rgba(28,28,30,0.7)',
          }}
        >
          <ChevronLeft size={16} />
          上一步
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 disabled:opacity-30"
            style={{
              background: '#007AFF',
              color: 'white',
              boxShadow: '0 2px 8px rgba(0,122,255,0.3)',
            }}
          >
            下一步
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={!canNext()}
            className="flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-200 disabled:opacity-30"
            style={{
              background: '#007AFF',
              color: 'white',
              boxShadow: '0 2px 12px rgba(0,122,255,0.3)',
            }}
          >
            确定开始
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
