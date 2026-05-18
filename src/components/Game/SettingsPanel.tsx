import { X, Languages, Type, Globe, Key, CheckCircle, AlertCircle, Server, Cpu, Lock } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { useState } from 'react'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const showTranslation = useSettingsStore((s) => s.showTranslation)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const language = useSettingsStore((s) => s.language)
  const apiProxyUrl = useSettingsStore((s) => s.apiProxyUrl)
  const proxyAccessToken = useSettingsStore((s) => s.proxyAccessToken)
  const apiModel = useSettingsStore((s) => s.apiModel)
  const toggleTranslation = useSettingsStore((s) => s.toggleTranslation)
  const setFontSize = useSettingsStore((s) => s.setFontSize)
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const setApiProxyUrl = useSettingsStore((s) => s.setApiProxyUrl)
  const setProxyAccessToken = useSettingsStore((s) => s.setProxyAccessToken)
  const setApiModel = useSettingsStore((s) => s.setApiModel)

  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle')
  const [testError, setTestError] = useState('')

  if (!isOpen) return null

  const fontSizes: { key: 'small' | 'medium' | 'large'; label: string }[] = [
    { key: 'small', label: '小' },
    { key: 'medium', label: '中' },
    { key: 'large', label: '大' },
  ]

  const proxyUrl = (apiProxyUrl.trim() || '/api').replace(/\/+$/, '')
  const hasProxy = proxyUrl.length > 0

  const handleTestConnection = async () => {
    setTestResult('testing')
    setTestError('')

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (proxyAccessToken.trim()) {
        headers['X-Proxy-Access-Token'] = proxyAccessToken.trim()
      }

      const response = await fetch(`${proxyUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: apiModel || 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      })

      if (response.ok) {
        setTestResult('success')
      } else {
        const errText = await response.text().catch(() => '')
        setTestResult('fail')
        setTestError(`HTTP ${response.status}: ${errText.slice(0, 160)}`)
      }
    } catch (err: any) {
      setTestResult('fail')
      setTestError(err.message || '连接失败')
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 shrink-0">
          <h2 className="text-[#1C1C1E] font-bold">设置</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
            aria-label="关闭设置"
          >
            <X size={14} className="text-[#1C1C1E]/70" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Key size={16} style={{ color: '#f59e0b' }} />
              <span className="text-[#1C1C1E]/80 text-sm font-medium">AI 代理</span>
              {hasProxy ? (
                <CheckCircle size={14} style={{ color: '#34C759' }} />
              ) : (
                <AlertCircle size={14} style={{ color: '#FF3B30' }} />
              )}
            </div>

            <div
              className="mb-3 p-3 rounded-xl text-xs leading-relaxed"
              style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.15)',
                color: 'rgba(28,28,30,0.68)',
              }}
            >
              浏览器只连接后端代理，真实 API Key 由服务器从 apikey.txt 读取并轮换。
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleTestConnection}
                disabled={!hasProxy || testResult === 'testing'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all disabled:opacity-30"
                style={{
                  background: testResult === 'success'
                    ? 'rgba(52,199,94,0.1)'
                    : testResult === 'fail'
                    ? 'rgba(255,59,48,0.1)'
                    : 'rgba(0,0,0,0.04)',
                  border: testResult === 'success'
                    ? '1px solid rgba(52,199,94,0.2)'
                    : testResult === 'fail'
                    ? '1px solid rgba(255,59,48,0.2)'
                    : '1px solid rgba(0,0,0,0.06)',
                  color: testResult === 'success'
                    ? '#34C759'
                    : testResult === 'fail'
                    ? '#FF3B30'
                    : 'rgba(28,28,30,0.5)',
                }}
              >
                {testResult === 'testing' ? '测试中...' : testResult === 'success' ? '连接成功' : testResult === 'fail' ? '连接失败' : '测试连接'}
              </button>
            </div>

            {testError && (
              <p className="text-red-500/70 text-[10px] mt-1.5 break-all">{testError}</p>
            )}
          </div>

          <div className="h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Server size={16} style={{ color: '#6366f1' }} />
              <span className="text-[#1C1C1E]/80 text-sm">代理地址</span>
            </div>
            <input
              type="text"
              value={apiProxyUrl}
              onChange={(e) => setApiProxyUrl(e.target.value)}
              placeholder="/api"
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                color: '#1C1C1E',
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lock size={16} style={{ color: '#0ea5e9' }} />
              <span className="text-[#1C1C1E]/80 text-sm">访问口令</span>
            </div>
            <input
              type="password"
              value={proxyAccessToken}
              onChange={(e) => setProxyAccessToken(e.target.value)}
              placeholder="没有设置可留空"
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                color: '#1C1C1E',
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={16} style={{ color: '#8b5cf6' }} />
              <span className="text-[#1C1C1E]/80 text-sm">模型名称</span>
            </div>
            <input
              type="text"
              value={apiModel}
              onChange={(e) => setApiModel(e.target.value)}
              placeholder="deepseek-chat"
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                color: '#1C1C1E',
              }}
            />
          </div>

          <div className="h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Languages size={16} style={{ color: '#007AFF' }} />
                <span className="text-[#1C1C1E]/80 text-sm">显示韩文翻译</span>
              </div>
              <button
                onClick={toggleTranslation}
                className="w-11 h-6 rounded-full transition-all duration-200 relative"
                aria-label="切换翻译显示"
                style={{
                  background: showTranslation
                    ? '#007AFF'
                    : 'rgba(0,0,0,0.08)',
                  boxShadow: showTranslation ? '0 0 10px rgba(0,122,255,0.3)' : 'none',
                }}
              >
                <div
                  className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all duration-200"
                  style={{
                    left: showTranslation ? '22px' : '2px',
                  }}
                />
              </button>
            </div>
            <p className="text-[#8E8E93]/50 text-[10px]">
              {showTranslation ? '韩文消息下方显示中文翻译' : '仅显示韩文原文'}
            </p>
          </div>

          <div className="h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Type size={16} style={{ color: '#c084fc' }} />
              <span className="text-[#1C1C1E]/80 text-sm">字体大小</span>
            </div>
            <div className="flex gap-2">
              {fontSizes.map((fs) => (
                <button
                  key={fs.key}
                  onClick={() => setFontSize(fs.key)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: fontSize === fs.key
                      ? 'rgba(168,85,247,0.08)'
                      : 'rgba(0,0,0,0.03)',
                    border: fontSize === fs.key
                      ? '1px solid rgba(168,85,247,0.2)'
                      : '1px solid rgba(0,0,0,0.06)',
                    color: fontSize === fs.key ? '#c084fc' : 'rgba(28,28,30,0.5)',
                  }}
                >
                  {fs.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe size={16} style={{ color: '#34C759' }} />
              <span className="text-[#1C1C1E]/80 text-sm">语言显示</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('zh')}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: language === 'zh'
                    ? 'rgba(52,199,94,0.08)'
                    : 'rgba(0,0,0,0.03)',
                  border: language === 'zh'
                    ? '1px solid rgba(52,199,94,0.2)'
                    : '1px solid rgba(0,0,0,0.06)',
                  color: language === 'zh' ? '#34C759' : 'rgba(28,28,30,0.5)',
                }}
              >
                中文优先
              </button>
              <button
                onClick={() => setLanguage('ko')}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: language === 'ko'
                    ? 'rgba(52,199,94,0.08)'
                    : 'rgba(0,0,0,0.03)',
                  border: language === 'ko'
                    ? '1px solid rgba(52,199,94,0.2)'
                    : '1px solid rgba(0,0,0,0.06)',
                  color: language === 'ko' ? '#34C759' : 'rgba(28,28,30,0.5)',
                }}
              >
                韩文优先
              </button>
            </div>
            <p className="text-[#8E8E93]/50 text-[10px] mt-2">
              界面保持中文，此设置影响聊天中哪种语言作为主文字。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
