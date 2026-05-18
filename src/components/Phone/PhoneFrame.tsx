import type { ReactNode } from 'react'
import { useGameStore } from '@/store/gameStore'
import StatusBar from './StatusBar'

const appNames: Record<string, string> = {
  kakaoTalk: 'KakaoTalk',
  instagram: 'Instagram',
  weverse: 'Weverse',
  naver: 'Naver',
  companyNotice: 'Company Notice',
  dispatch: 'Dispatch',
  offline: '线下',
  calendar: 'Calendar',
  gallery: 'Gallery',
  notes: 'Notes',
  health: 'Health',
}

interface PhoneFrameProps {
  children: ReactNode
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  const currentApp = useGameStore((s) => s.currentApp)
  const closeApp = useGameStore((s) => s.closeApp)

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ background: '#F2F2F7' }}>
      <div
        className="relative w-[375px] h-[812px] rounded-[3rem] overflow-hidden"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 20px 60px rgba(0,0,0,0.12)',
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150px] h-[30px] bg-black rounded-b-2xl z-50" />

        <div className="flex flex-col h-full relative z-10">
          <StatusBar />

          {currentApp && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border-b border-black/5">
              <button
                onClick={closeApp}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1L9 9M9 1L1 9" stroke="#1C1C1E" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <span className="text-[#1C1C1E] text-sm font-semibold">
                {appNames[currentApp] || currentApp}
              </span>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-black/15 rounded-full z-50" />
      </div>
    </div>
  )
}
