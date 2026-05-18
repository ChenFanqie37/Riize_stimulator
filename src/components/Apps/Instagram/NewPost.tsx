import { useEffect, useState } from 'react'
import { X, MapPin, AlertTriangle, Image as ImageIcon } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { createClueFromPost, calculatePostRisk } from '@/engine/clueEngine'
import type { PostType, Visibility, InstagramPost } from '@/types/game'

const categories = [
  { id: 'normal', label: '普通生活照', risk: 5, affection: 2, desc: '日常分享，低风险' },
  { id: 'ambiguous', label: '暧昧暗号', risk: 35, affection: 8, desc: '暗示性内容，他可能会注意到' },
  { id: 'emotional', label: '情绪化Story', risk: 20, affection: 5, desc: '表达情绪，可能引发关心' },
  { id: 'provocative', label: '挑衅型Story', risk: 45, affection: -3, desc: '故意刺激，高风险高反应' },
  { id: 'smokescreen', label: '烟雾弹Story', risk: 15, affection: 1, desc: '转移注意力，降低怀疑' },
] as const

const visibilityOptions: { id: Visibility; label: string; riskMod: number }[] = [
  { id: 'public', label: '公开', riskMod: 0 },
  { id: 'friends', label: '好友', riskMod: -10 },
  { id: 'close_friends', label: '密友', riskMod: -20 },
  { id: 'private', label: '私密', riskMod: -30 },
]

function getRiskColor(risk: number) {
  if (risk <= 20) return 'text-green-500'
  if (risk <= 40) return 'text-yellow-500'
  if (risk <= 60) return 'text-orange-500'
  return 'text-red-500'
}

function getRiskBg(risk: number) {
  if (risk <= 20) return 'bg-green-500'
  if (risk <= 40) return 'bg-yellow-500'
  if (risk <= 60) return 'bg-orange-500'
  return 'bg-red-500'
}

export default function NewPost({ onClose }: { onClose: () => void }) {
  const postInstagram = useGameStore((s) => s.postInstagram)
  const updateStats = useGameStore((s) => s.updateStats)
  const addNotification = useGameStore((s) => s.addNotification)
  const player = useGameStore((s) => s.player)
  const risk = useGameStore((s) => s.risk)
  const hiddenRisk = useGameStore((s) => s.hiddenRisk)
  const addClue = useGameStore((s) => s.addClue)
  const updateHiddenRisk = useGameStore((s) => s.updateHiddenRisk)
  const day = useGameStore((s) => s.day)
  const week = useGameStore((s) => s.week)
  const galleryPhotos = useGameStore((s) => s.gallery.photos)
  const pendingDraft = useGameStore((s) => s.pendingInstagramDraft)

  const [postType, setPostType] = useState<PostType>(pendingDraft?.postType || 'post')
  const [category, setCategory] = useState<string>(pendingDraft?.category || 'normal')
  const [caption, setCaption] = useState(pendingDraft?.caption || '')
  const [visibility, setVisibility] = useState<Visibility>(pendingDraft?.visibility || 'public')
  const [showLocation, setShowLocation] = useState(pendingDraft?.showLocation || false)
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | undefined>(pendingDraft?.sourcePhotoId)

  useEffect(() => {
    if (!pendingDraft) return
    setPostType(pendingDraft.postType)
    setCategory(pendingDraft.category)
    setCaption(pendingDraft.caption)
    setVisibility(pendingDraft.visibility)
    setShowLocation(pendingDraft.showLocation)
    setSelectedPhotoId(pendingDraft.sourcePhotoId)
    useGameStore.setState({ pendingInstagramDraft: null })
  }, [pendingDraft])

  const selectedCategory = categories.find((c) => c.id === category)!
  const visibilityOption = visibilityOptions.find((v) => v.id === visibility)!
  const baseRisk = selectedCategory.risk
  const riskMod = visibilityOption.riskMod
  const totalRisk = Math.max(0, Math.min(100, baseRisk + riskMod + (risk.fanSuspicion > 50 ? 10 : 0)))

  const handlePost = () => {
    const selectedPhoto = galleryPhotos.find((photo) => photo.id === selectedPhotoId)
    const imageTags = selectedPhoto
      ? [selectedPhoto.source, selectedPhoto.riskLevel === 'high' ? 'couple' : 'mood']
      : category === 'normal'
        ? ['selfie']
        : category === 'ambiguous'
          ? ['couple', 'mood']
          : category === 'emotional'
            ? ['mood', 'night']
            : category === 'provocative'
              ? ['night', 'selfie']
              : ['cafe', 'food']
    const { riskScore, hiddenRiskChanges } = calculatePostRisk(caption, imageTags, visibility, hiddenRisk)
    const post: InstagramPost = {
      id: `ig_${Date.now()}`,
      author: 'player',
      authorName: player.name,
      contentType: postType,
      text: caption,
      imageTags,
      location: showLocation ? '首尔' : undefined,
      visibility,
      riskScore,
      likes: Math.floor(Math.random() * 50) + 5,
      comments: [],
      views: Math.floor(Math.random() * 200) + 20,
      isDeleted: false,
      isScreenshotted: false,
      screenshottedBy: [],
      boyfriendViewed: false,
      createdAt: Date.now(),
      expiresAt: postType === 'story' ? Date.now() + 24 * 60 * 60 * 1000 : undefined,
    }
    postInstagram(post)
    const clues = createClueFromPost(caption, imageTags, 'instagram', day, week, visibility)
    clues.forEach(clue => {
      if (clue.clueType) {
        addClue(clue as any)
      }
    })
    if (Object.keys(hiddenRiskChanges).length > 0) {
      updateHiddenRisk(hiddenRiskChanges)
    }
    updateStats({
      affection: category === 'ambiguous' ? 3 : category === 'provocative' ? -1 : 1,
      fanSuspicion: Math.ceil(riskScore / 18) + (showLocation ? 2 : 0),
      publicHeat: riskScore >= 40 ? 5 : 1,
      secrecy: -Math.ceil(riskScore / 28),
      paparazziAttention: showLocation ? 4 : riskScore >= 45 ? 2 : 0,
    })
    addNotification({
      id: `notif_ig_${Date.now()}`,
      app: 'instagram',
      title: 'Instagram 已发布',
      content: riskScore >= 35 ? '这条帖子的线索较明显，粉丝可能会开始截图讨论。' : '帖子发布成功，暂时没有明显异常。',
      urgency: riskScore >= 35 ? 'high' : 'medium',
      isRead: false,
      createdAt: Date.now(),
    })
    if (riskScore >= 35) {
      useGameStore.setState((state) => ({
        weverse: {
          ...state.weverse,
          posts: [
            ...state.weverse.posts,
            {
              id: `wv_ig_post_${Date.now()}`,
              type: 'analysis',
              author: 'zoom_in_briize',
              title: '이 사진 배경 좀 익숙하지 않아?',
              content: `有人开始放大你刚发的照片。背景、时间和${state.maleLead.stageName}的行程被拿来对比，但评论区还在吵“别造谣”。`,
              heat: Math.min(100, 28 + riskScore + state.risk.fanSuspicion),
              comments: 80 + riskScore,
              isPlayerAlt: false,
              relatedEvidenceIds: [],
              createdAt: Date.now(),
            },
          ],
        },
      }))
    }
    onClose()
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)',
        }}
      >
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center">
          <X size={20} className="text-white" />
        </button>
        <span className="text-white font-bold text-sm">新帖子</span>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="mb-4">
          <p className="text-xs font-semibold text-[#3C3C3C] mb-2">类型</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPostType('post')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                postType === 'post'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              帖子
            </button>
            <button
              onClick={() => setPostType('story')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                postType === 'story'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              Story
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-[#3C3C3C] mb-2">从相册选照片</p>
          {galleryPhotos.filter((photo) => !photo.isDeleted).length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {galleryPhotos
                .filter((photo) => !photo.isDeleted)
                .slice(-8)
                .reverse()
                .map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhotoId(selectedPhotoId === photo.id ? undefined : photo.id)}
                    className={`shrink-0 w-24 rounded-lg border p-2 text-left transition-all ${
                      selectedPhotoId === photo.id
                        ? 'border-pink-400 bg-pink-50'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="w-full aspect-square rounded-md bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200 flex items-center justify-center mb-1.5">
                      <ImageIcon size={18} className="text-white" />
                    </div>
                    <p className="text-[10px] font-semibold text-[#3C3C3C] truncate">{photo.title}</p>
                    <p className={`text-[9px] mt-0.5 ${
                      photo.riskLevel === 'high' ? 'text-red-500' : photo.riskLevel === 'medium' ? 'text-orange-500' : 'text-green-500'
                    }`}>
                      {photo.riskLevel === 'high' ? '高危照片' : photo.riskLevel === 'medium' ? '暧昧痕迹' : '低风险'}
                    </p>
                  </button>
                ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-[11px] text-gray-400">
              相册还没有可用照片。约会后保存照片，就可以在这里选。
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-[#3C3C3C] mb-2">内容分类</p>
          <div className="flex flex-col gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  category === cat.id
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
                    : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex-1">
                  <span className={`text-xs font-medium ${category === cat.id ? 'text-purple-700' : 'text-[#3C3C3C]'}`}>
                    {cat.label}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">{cat.desc}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${getRiskBg(cat.risk)}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-[#3C3C3C] mb-2">文案</p>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="写点什么..."
            className="w-full h-20 px-3 py-2 rounded-lg bg-gray-50 text-sm text-[#3C3C3C] outline-none resize-none placeholder-gray-400 border border-gray-100 focus:border-purple-300"
          />
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-[#3C3C3C] mb-2">可见范围</p>
          <div className="flex flex-wrap gap-2">
            {visibilityOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setVisibility(opt.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  visibility === opt.id
                    ? 'bg-[#3C3C3C] text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={() => setShowLocation(!showLocation)}
            className="flex items-center gap-2 text-xs"
          >
            <MapPin size={14} className={showLocation ? 'text-red-500' : 'text-gray-400'} />
            <span className={showLocation ? 'text-red-500' : 'text-gray-400'}>
              {showLocation ? '首尔 · 已开启定位' : '添加位置'}
            </span>
          </button>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className={getRiskColor(totalRisk)} />
            <span className="text-xs font-semibold text-[#3C3C3C]">风险预览</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getRiskBg(totalRisk)}`}
                style={{ width: `${totalRisk}%` }}
              />
            </div>
            <span className={`text-xs font-bold ${getRiskColor(totalRisk)}`}>{totalRisk}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            {totalRisk <= 20 ? '安全范围，不太会引起注意' :
             totalRisk <= 40 ? '有一定风险，粉丝可能讨论' :
             totalRisk <= 60 ? '高风险！公司可能会注意到' :
             '极度危险！可能引发危机'}
          </p>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-500 text-sm font-medium"
        >
          取消
        </button>
        <button
          onClick={handlePost}
          disabled={!caption.trim()}
          className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)',
          }}
        >
          发布
        </button>
      </div>
    </div>
  )
}
