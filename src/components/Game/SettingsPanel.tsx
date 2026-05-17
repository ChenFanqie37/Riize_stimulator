import { X, Languages, Type, Globe, Key, Plus, Trash2, Eye, EyeOff, CheckCircle, AlertCircle, Server, Cpu } from 'lucide-react'
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
  const apiKeys = useSettingsStore((s) => s.apiKeys)
  const apiBaseUrl = useSettingsStore((s) => s.apiBaseUrl)
  const apiModel = useSettingsStore((s) => s.apiModel)
  const toggleTranslation = useSettingsStore((s) => s.toggleTranslation)
  const setFontSize = useSettingsStore((s) => s.setFontSize)
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const setApiKeys = useSettingsStore((s) => s.setApiKeys)
  const setApiBaseUrl = useSettingsStore((s) => s.setApiBaseUrl)
  const setApiModel = useSettingsStore((s) => s.setApiModel)
  const addApiKey = useSettingsStore((s) => s.addApiKey)
  const removeApiKey = useSettingsStore((s) => s.removeApiKey)

  const [newKey, setNewKey] = useState('')
  const [showKeys, setShowKeys] = useState(false)
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle')
  const [testError, setTestError] = useState('')

  if (!isOpen) return null

  const fontSizes: { key: 'small' | 'medium' | 'large'; label: string }[] = [
    { key: 'small', label: '小' },
    { key: 'medium', label: '中' },
    { key: 'large', label: '大' },
  ]

  const maskKey = (key: string) => {
    if (key.length <= 8) return '****'
    return key.slice(0, 4) + '****' + key.slice(-4)
  }

  const handleAddKey = () => {
    const trimmed = newKey.trim()
    if (trimmed.length > 10) {
      addApiKey(trimmed)
      setNewKey('')
    }
  }

  const handleTestConnection = async () => {
    setTestResult('testing')
    setTestError('')
    try {
      const key = apiKeys.length > 0 ? apiKeys[0] : ''
      const baseUrl = apiBaseUrl || 'https://api.deepseek.com'
      const model = apiModel || 'deepseek-chat'
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5
        })
      })
      if (response.ok) {
        setTestResult('success')
      } else {
        const errText = await response.text().catch(() => '')
        setTestResult('fail')
        setTestError(`HTTP ${response.status}: ${errText.slice(0, 100)}`)
      }
    } catch (err: any) {
      setTestResult('fail')
      setTestError(err.message || '连接失败')
    }
  }

  const hasValidKey = apiKeys.length > 0 && apiKeys[0] !== 'YOUR_API_KEY_HERE' && apiKeys[0].length > 10

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
          >
            <X size={14} className="text-[#1C1C1E]/70" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Key size={16} style={{ color: '#f59e0b' }} />
              <span className="text-[#1C1C1E]/80 text-sm font-medium">API 密钥</span>
              {hasValidKey ? (
                <CheckCircle size={14} style={{ color: '#34C759' }} />
              ) : (
                <AlertCircle size={14} style={{ color: '#FF3B30' }} />
              )}
            </div>

            {!hasValidKey && (
              <div
                className="mb-3 p-3 rounded-xl text-xs"
                style={{
                  background: 'rgba(255,59,48,0.08)',
                  border: '1px solid rgba(255,59,48,0.15)',
                  color: 'rgba(255,59,48,0.8)',
                }}
              >
                ⚠️ 未配置API密钥，AI聊天功能将无法使用。请输入你的DeepSeek API Key。
              </div>
            )}

            <div className="space-y-2 mb-3">
              {apiKeys.map((key, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl"
                  style={{
                    background: 'rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <span className="text-[#1C1C1E]/50 text-xs font-mono flex-1 truncate">
                    {showKeys ? key : maskKey(key)}
                  </span>
                  <button
                    onClick={() => removeApiKey(idx)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={12} className="text-red-500/60" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddKey()}
                placeholder="输入新的API Key..."
                className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                  color: '#1C1C1E',
                }}
              />
              <button
                onClick={handleAddKey}
                disabled={newKey.trim().length <= 10}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-30"
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  color: '#f59e0b',
                }}
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowKeys(!showKeys)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all"
                style={{
                  background: 'rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  color: 'rgba(28,28,30,0.5)',
                }}
              >
                {showKeys ? <EyeOff size={10} /> : <Eye size={10} />}
                {showKeys ? '隐藏' : '显示'}
              </button>
              <button
                onClick={handleTestConnection}
                disabled={!hasValidKey || testResult === 'testing'}
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
                {testResult === 'testing' ? '测试中...' : testResult === 'success' ? '✓ 连接成功' : testResult === 'fail' ? '✗ 连接失败' : '测试连接'}
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
              <span className="text-[#1C1C1E]/80 text-sm">API 地址</span>
            </div>
            <input
              type="text"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="https://api.deepseek.com"
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
                한국어 우선
              </button>
            </div>
            <p className="text-[#8E8E93]/50 text-[10px] mt-2">
              界面始终为中文，此设置影响聊天中哪种语言显示为主文字
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
