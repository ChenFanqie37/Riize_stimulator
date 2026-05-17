import { useState } from 'react'
import { Home, PlusSquare, User } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import Feed from './Feed'
import Story from './Story'
import NewPost from './NewPost'

type Tab = 'feed' | 'newpost' | 'profile'

export default function Instagram() {
  const [tab, setTab] = useState<Tab>('feed')
  const [viewingStoryId, setViewingStoryId] = useState<string | null>(null)
  const player = useGameStore((s) => s.player)
  const posts = useGameStore((s) => s.instagram.posts)
  const stories = useGameStore((s) => s.instagram.stories)

  if (viewingStoryId) {
    return <Story storyId={viewingStoryId} onClose={() => setViewingStoryId(null)} />
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-hidden">
        {tab === 'feed' && (
          <Feed
            onViewStory={(id) => setViewingStoryId(id)}
            onNewPost={() => setTab('newpost')}
          />
        )}
        {tab === 'newpost' && (
          <NewPost onClose={() => setTab('feed')} />
        )}
        {tab === 'profile' && (
          <div className="flex flex-col h-full bg-white">
            <div
              className="px-4 py-3"
              style={{
                background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)',
              }}
            >
              <p className="text-white font-bold text-sm">{player.name}</p>
            </div>
            <div className="flex items-center gap-6 px-4 py-4 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold">
                {player.name.charAt(0)}
              </div>
              <div className="flex gap-5">
                <div className="text-center">
                  <p className="text-sm font-bold text-[#3C3C3C]">{posts.filter(p => !p.isDeleted).length}</p>
                  <p className="text-[10px] text-gray-400">帖子</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#3C3C3C]">{stories.filter(s => !s.isDeleted).length}</p>
                  <p className="text-[10px] text-gray-400">故事</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-px bg-gray-100 flex-1 overflow-y-auto">
              {posts.filter(p => !p.isDeleted).map((post) => (
                <div
                  key={post.id}
                  className="aspect-square bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center"
                >
                  <span className="text-white/30 text-2xl">📷</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {tab !== 'newpost' && (
        <div className="flex items-center justify-around py-2 border-t border-gray-100 bg-white">
          <button
            onClick={() => setTab('feed')}
            className="flex flex-col items-center gap-0.5"
          >
            <Home
              size={22}
              className={tab === 'feed' ? 'text-[#3C3C3C]' : 'text-gray-400'}
              fill={tab === 'feed' ? '#3C3C3C' : 'none'}
            />
          </button>
          <button
            onClick={() => setTab('newpost')}
            className="flex flex-col items-center gap-0.5"
          >
            <PlusSquare size={22} className="text-gray-400" />
          </button>
          <button
            onClick={() => setTab('profile')}
            className="flex flex-col items-center gap-0.5"
          >
            <User
              size={22}
              className={tab === 'profile' ? 'text-[#3C3C3C]' : 'text-gray-400'}
              fill={tab === 'profile' ? '#3C3C3C' : 'none'}
            />
          </button>
        </div>
      )}
    </div>
  )
}
