'use client'

import { useEffect, useState } from 'react'

interface YouTubePlayerProps {
  videoId: string
  autoplay?: boolean
  startTime?: number
  onTimeUpdate?: (currentTime: number) => void
  className?: string
}

export default function YouTubePlayer({ 
  videoId, 
  autoplay = false, 
  startTime = 0,
  onTimeUpdate,
  className = ""
}: YouTubePlayerProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [player, setPlayer] = useState<any>(null)
  
  // Инициализация YouTube API
  useEffect(() => {
    // Загрузка YouTube API если она еще не загружена
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
      
      window.onYouTubeIframeAPIReady = initPlayer
    } else {
      initPlayer()
    }
    
    function initPlayer() {
      setIsMounted(true)
    }
    
    return () => {
      if (player) {
        player.destroy()
      }
    }
  }, [videoId])
  
  // Создание плеера после того, как компонент смонтирован и API загружен
  useEffect(() => {
    if (isMounted && window.YT && window.YT.Player) {
      const newPlayer = new window.YT.Player(`youtube-player-${videoId}`, {
        videoId: videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          start: startTime,
          rel: 0,
          modestbranding: 1,
          playsinline: 1
        },
        events: {
          onStateChange: (event: any) => {
            // Отслеживание времени просмотра если нужно
            if (onTimeUpdate && event.data === window.YT.PlayerState.PLAYING) {
              const timeUpdateInterval = setInterval(() => {
                if (player) {
                  const currentTime = player.getCurrentTime()
                  onTimeUpdate(currentTime)
                }
              }, 5000) // Обновление каждые 5 секунд
              
              return () => clearInterval(timeUpdateInterval)
            }
          }
        }
      })
      
      setPlayer(newPlayer)
    }
  }, [isMounted, videoId, autoplay, startTime, onTimeUpdate])
  
  return (
    <div className={`aspect-video w-full rounded-lg overflow-hidden shadow-lg ${className}`}>
      <div id={`youtube-player-${videoId}`} className="w-full h-full"></div>
    </div>
  )
}

// Для TypeScript
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
} 