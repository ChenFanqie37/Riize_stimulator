import { ShieldAlert } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { AppName } from '@/types/game'

interface AppAccountBarProps {
  app: AppName
  tone?: 'light' | 'dark'
}

const typeLabels = {
  main: '主号',
  alt: '小号',
  anonymous: '匿名',
  official: '通行',
  private: '私密',
}

export default function AppAccountBar({ app, tone = 'light' }: AppAccountBarProps) {
  const account = useGameStore((s) => s.appAccounts[app])
  const risk = useGameStore((s) => s.risk)
  if (!account) return null

  const dark = tone === 'dark'
  const danger = app === 'instagram'
    ? risk.fanSuspicion
    : app === 'weverse'
      ? Math.max(risk.fanSuspicion, risk.publicHeat)
      : app === 'companyNotice'
        ? risk.companyAlert
        : app === 'dispatch'
          ? risk.paparazziAttention
          : 0

  return (
    <div
      className="mx-3 my-2 rounded-lg px-3 py-2 flex items-center gap-2"
      style={{
        background: dark ? 'rgba(255,255,255,0.06)' : '#F9FAFB',
        border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #EEF0F3',
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background: account.isAnonymous ? '#111827' : '#FFE4EF',
          color: account.isAnonymous ? 'white' : '#DB2777',
        }}
      >
        {account.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold truncate ${dark ? 'text-white' : 'text-gray-800'}`}>
            {account.displayName}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-50 text-pink-500">
            {typeLabels[account.accountType]}
          </span>
          {danger >= 55 && <ShieldAlert size={12} className="text-red-500 flex-shrink-0" />}
        </div>
        <p className={`text-[10px] truncate ${dark ? 'text-white/45' : 'text-gray-400'}`}>
          {account.handle} · {account.persona} · {account.riskNote}
        </p>
      </div>
    </div>
  )
}
