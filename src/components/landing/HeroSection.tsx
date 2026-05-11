import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import AppStoreButtons from './AppStoreButtons'

interface HeroSectionProps {
  isScrolled?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export function Hero({ isScrolled = false, isMuted = true, onToggleMute }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Ensure video is muted immediately on load to prevent any audio
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0
      videoRef.current.muted = true
      videoRef.current.defaultMuted = true

      // Force mute on play
      videoRef.current.addEventListener('play', () => {
        if (videoRef.current) {
          videoRef.current.muted = isMuted
          videoRef.current.volume = isMuted ? 0 : 0.7
        }
      })

      // Try to play the video
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => console.error('Video autoplay failed:', error))
      }
    }
  }, [])

  // Update video mute state when isMuted changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
      videoRef.current.volume = isMuted ? 0 : 0.7
    }
  }, [isMuted])

  return (
    <div
      id="home"
      className="relative w-full bg-black transition-all duration-500 ease-out"
      style={{
        height: isScrolled ? 'calc(100vh - 32px)' : '100vh',
        width: isScrolled ? 'calc(100% - 32px)' : '100%',
        margin: isScrolled ? '16px' : '0px',
        borderRadius: isScrolled ? '20px' : '0px',
        overflow: 'hidden',
        boxShadow: isScrolled ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none',
      }}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover scale-110"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="https://mojli.s3.us-east-2.amazonaws.com/Mojli+Website+upscaled+(12mb).webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 z-10" />

      {/* Big Studio Title - Lower Left */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-12 left-6 sm:left-8 lg:left-12 z-40"
      >
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-white mb-8">
            <span className="block">WHERE</span>
            <span className="block">CREATIVITY MEETS</span>
            <span className="block">OPPORTUNITY</span>
          </h1>
          <AppStoreButtons dark={false} className="mt-4" />
        </div>
      </motion.div>

    </div>
  )
}

export default Hero;
