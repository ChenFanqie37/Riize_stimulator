import { useState } from 'react'
import { X, Camera, Trash2, Phone, MapPin, Ban, Search, Shield, Coffee, Megaphone, Sparkles } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { getIdentityIncidentScript } from '@/data/identityGameplay'
import type { LucideIcon } from 'lucide-react'

interface ActionDef {
  id: string
  name: string
  icon: LucideIcon
  riskPreview: string
  riskDetail: string
  isDisabled: (state: ReturnType<typeof useGameStore.getState>) => boolean
  disabledReason: string
}

const actions: ActionDef[] = [
  {
    id: 'post_instagram_story',
    name: '发Instagram Story',
    icon: Camera,
    riskPreview: '可能被截图',
    riskDetail: '发布Story会增加恋情曝光风险。粉丝可能截图分析，舆论热度+5，恋情保密度-5。',
    isDisabled: () => false,
    disabledReason: '',
  },
  {
    id: 'delete_suspicious_post',
    name: '删除可疑动态',
    icon: Trash2,
    riskPreview: '删帖本身可疑',
    riskDetail: '删除已有的可疑帖子可以降低证据，但"删帖"行为本身可能引起粉丝更多怀疑。粉丝怀疑度+3。',
    isDisabled: (s) => s.instagram.posts.filter(p => !p.isDeleted && p.riskScore > 30).length === 0 && s.instagram.stories.filter(p => !p.isDeleted && p.riskScore > 30).length === 0,
    disabledReason: '没有可疑动态可删除',
  },
  {
    id: 'call_boyfriend',
    name: '给他打电话',
    icon: Phone,
    riskPreview: '通话可能被监听',
    riskDetail: '打电话可以增进感情，但通话记录可能被公司检查。好感度+5，公司警觉度+3。',
    isDisabled: (s) => s.relationshipStatus === 'cold_war' && s.maleLead.affection < 30,
    disabledReason: '冷战期间好感度不足',
  },
  {
    id: 'request_meet',
    name: '约他见面',
    icon: MapPin,
    riskPreview: '见面有被拍风险',
    riskDetail: '见面可以大幅增进感情，但被拍到的风险很高。好感度+8，舆论热度+8，恋情保密度-8。',
    isDisabled: () => false,
    disabledReason: '',
  },
  {
    id: 'refuse_meet',
    name: '拒绝见面',
    icon: Ban,
    riskPreview: '可能伤害感情',
    riskDetail: '拒绝见面可以降低曝光风险，但会伤害他的感情。好感度-5，恋情保密度+5。',
    isDisabled: () => false,
    disabledReason: '',
  },
  {
    id: 'search_self',
    name: '搜索自己名字',
    icon: Search,
    riskPreview: '了解舆论动向',
    riskDetail: '搜索自己的名字可以了解当前舆论态势，但搜索记录本身也是痕迹。无直接风险。',
    isDisabled: () => false,
    disabledReason: '',
  },
  {
    id: 'alt_account_control',
    name: '开小号控评',
    icon: Shield,
    riskPreview: '小号可能被扒',
    riskDetail: '开小号引导舆论可以降低粉丝怀疑，但小号本身可能被扒出。粉丝怀疑度-5，如果失败则+15。',
    isDisabled: (s) => s.player.popularity < 10,
    disabledReason: '知名度不足',
  },
  {
    id: 'request_calm',
    name: '要求冷静几天',
    icon: Coffee,
    riskPreview: '暂时降低冲突',
    riskDetail: '要求冷静可以暂时降低冲突，但可能被误解为冷暴力。事业压力-5，好感度-3。',
    isDisabled: () => false,
    disabledReason: '',
  },
  {
    id: 'demand_public',
    name: '让他公开',
    icon: Megaphone,
    riskPreview: '极大压力',
    riskDetail: '要求公开关系会给他极大压力。如果好感度和信任度够高，可能走向HE；否则可能导致分手。信任度-10，事业压力+20。',
    isDisabled: (s) => s.maleLead.affection < 50 || s.maleLead.trust < 40,
    disabledReason: '好感度或信任度不足',
  },
  {
    id: 'use_identity_ability',
    name: '使用身份特殊能力',
    icon: Sparkles,
    riskPreview: '身份专属技能',
    riskDetail: '使用你身份的特殊能力，效果取决于你的身份类型。每次使用都有特定风险。',
    isDisabled: (s) => s.player.actionPoints < 2,
    disabledReason: '行动点不足（需要2点）',
  },
]

interface ActionPanelProps {
  isOpen: boolean
  onClose: () => void
  onActionSelect?: (actionId: string) => void
}

export default function ActionPanel({ isOpen, onClose, onActionSelect }: ActionPanelProps) {
  const state = useGameStore()
  const performAction = useGameStore((s) => s.performAction)
  const [selectedAction, setSelectedAction] = useState<ActionDef | null>(null)
  const [lastResult, setLastResult] = useState<string | null>(null)
  const identityScript = getIdentityIncidentScript(state.player.identity)
  const visibleActions = actions.map((action) =>
    action.id === 'use_identity_ability'
      ? {
          ...action,
          name: identityScript.label,
          riskPreview: `跳转 ${identityScript.app}`,
          riskDetail: `${identityScript.detail} 这条身份路线会改变：${Object.entries(identityScript.statChanges)
            .map(([key, value]) => `${key}${value > 0 ? '+' : ''}${value}`)
            .join('，')}。`,
        }
      : action
  )

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!selectedAction) return
    const result = performAction(selectedAction.id)
    setLastResult(result)
    if (selectedAction.id === 'use_identity_ability') {
      useGameStore.getState().openApp(identityScript.app)
    }
    if (onActionSelect) onActionSelect(selectedAction.id)
    setSelectedAction(null)
  }

  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: 'rgba(10, 10, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        maxHeight: '70vh',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <h2 className="text-white font-bold">行动面板</h2>
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs">行动点: {state.player.actionPoints}</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={14} className="text-white/70" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {lastResult && (
          <div
            className="mb-3 px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'rgba(168,85,247,0.1)',
              border: '1px solid rgba(168,85,247,0.2)',
              color: '#c084fc',
            }}
          >
            {lastResult}
            <button
              onClick={() => setLastResult(null)}
              className="ml-2 text-white/30 hover:text-white/60"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {visibleActions.map((action) => {
            const Icon = action.icon
            const disabled = action.isDisabled(state)

            return (
              <button
                key={action.id}
                onClick={() => !disabled && setSelectedAction(action)}
                disabled={disabled || state.player.actionPoints <= 0}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed hover:scale-[1.02]"
                style={{
                  background: 'rgba(255,45,120,0.06)',
                  border: '1px solid rgba(255,45,120,0.12)',
                }}
              >
                <Icon size={20} style={{ color: disabled ? '#666' : '#ff6b9d' }} />
                <span className="text-white/80 text-xs font-medium text-center leading-tight">{action.name}</span>
                <span className="text-white/25 text-[9px] text-center">{action.riskPreview}</span>
              </button>
            )
          })}
        </div>
      </div>

      {selectedAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedAction(null)}
          />
          <div
            className="relative w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(20, 20, 35, 0.95)',
              border: '1px solid rgba(255,45,120,0.2)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 40px rgba(255,45,120,0.1)',
            }}
          >
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-white font-bold">{selectedAction.name}</h3>
            </div>
            <div className="p-5">
              <p className="text-white/60 text-sm mb-4">{selectedAction.riskDetail}</p>
              <div
                className="px-3 py-2 rounded-lg text-xs mb-5"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  color: '#f87171',
                }}
              >
                ⚠️ 风险预览：{selectedAction.riskPreview}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedAction(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #ff2d78, #ff6b9d)',
                    color: 'white',
                    boxShadow: '0 0 15px rgba(255,45,120,0.3)',
                  }}
                >
                  确认执行
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
