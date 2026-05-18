import { useGameStore } from '@/store/gameStore'

export default function CoverScreen() {
  const setPhase = useGameStore((s) => s.setPhase)

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 40%, #F5F3F0 100%)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineExpand {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }
        .cover-title {
          animation: fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s both;
        }
        .cover-line {
          animation: lineExpand 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.8s both;
        }
        .cover-subtitle {
          animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.2s both;
        }
        .cover-tagline {
          animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.6s both;
        }
        .cover-button {
          animation: scaleIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 2.0s both;
        }
        .cover-logo {
          animation: fadeInUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 2.3s both;
        }
        .bg-dot {
          animation: dotPulse 4s ease-in-out infinite;
        }
      `}</style>

      <div
        className="absolute inset-0 bg-dot"
        style={{
          backgroundImage: 'radial-gradient(circle, #00000008 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-8">
        <h1
          className="cover-title text-4xl md:text-6xl font-extralight tracking-wider text-[#1A1A1A] text-center"
          style={{ letterSpacing: '0.15em' }}
        >
          嫂嫂生存手记
        </h1>

        <div className="cover-line w-48 md:w-64 h-[2px] mt-6 mb-5 origin-center"
          style={{
            background: 'linear-gradient(90deg, #FF6B6B, #FFB347, #4ECDC4, #45B7D1, #96C93D, #DDA0DD)',
            borderRadius: '1px',
          }}
        />

        <p
          className="cover-tagline text-xs md:text-sm tracking-[0.4em] mt-4 text-[#B0B0B0] font-light"
        >
          哥哥你要幸福的话，只能和我...
        </p>

        <div className="cover-button mt-14">
          <button
            onClick={() => setPhase('creation')}
            className="px-14 py-3.5 rounded-full bg-[#1A1A1A] text-white text-sm font-medium tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              boxShadow: '0 2px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            开始游戏
          </button>
        </div>

        <div className="cover-logo mt-12 flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FF6B6B, #45B7D1)',
            }}
          >
            <span className="text-white text-[8px] font-bold">R</span>
          </div>
          <span className="text-[10px] tracking-[0.2em] text-[#CCCCCC] font-light">SECRET RIIZE DIARY</span>
        </div>
      </div>
    </div>
  )
}
