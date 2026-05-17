import { useState } from 'react'
import PostFeed from './PostFeed'
import Timeline from './Timeline'

type Tab = 'posts' | 'timeline'

export default function Weverse() {
  const [tab, setTab] = useState<Tab>('posts')

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        {tab === 'posts' && <PostFeed />}
        {tab === 'timeline' && <Timeline />}
      </div>
      <div className="flex items-center justify-around py-2 border-t border-gray-100 bg-white">
        <button
          onClick={() => setTab('posts')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium ${
            tab === 'posts' ? 'bg-[#00D4FF] text-white' : 'text-gray-400'
          }`}
        >
          帖子
        </button>
        <button
          onClick={() => setTab('timeline')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium ${
            tab === 'timeline' ? 'bg-[#00D4FF] text-white' : 'text-gray-400'
          }`}
        >
          时间线
        </button>
      </div>
    </div>
  )
}
