'use client'

import { useState, useEffect } from 'react'
import { Share2, Facebook, Twitter, Linkedin, Mail, MessageCircle, Copy } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from 'next/navigation'

interface ShareButtonProps {
  title: string
  description: string
}

export function ShareButton({ title, description }: ShareButtonProps) {
  const [isSupported, setIsSupported] = useState(false)
  const pathname = usePathname()
  const currentUrl = typeof window !== 'undefined' ? `${window.location.href}` : ''


  useEffect(() => {
    setIsSupported(typeof navigator !== 'undefined' && !!navigator.share)
  }, [])

  const handleNativeShare = async () => {

    try {
      await navigator.share({
        title,
        text: description,
        url: currentUrl,
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleSocialShare = (platform: string) => {

    let shareUrl = ''
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${currentUrl}`)}`
        break
      case 'sms':
        shareUrl = `sms:?&body=${encodeURIComponent(`${title}\n${currentUrl}`)}`
        break
    }
    if (shareUrl) window.open(shareUrl, '_blank')
  }

  const handleCopyUrl = async () => {

    try {
      await navigator.clipboard.writeText(currentUrl)
      // toast({
      //   title: "URL Copied",
      //   description: "The link has been copied to your clipboard.",
      // })
    } catch (error) {
      console.error('Failed to copy URL:', error)
      // toast({
      //   title: "Copy Failed",
      //   description: "Failed to copy the URL. Please try again.",
      //   variant: "destructive",
      // })
    }
  }

  const handleShare = () => {
    if (isSupported) {
      handleNativeShare()
    } else {
      // If Web Share API is not supported, open the dropdown
      const dropdownTrigger = document.getElementById('share-dropdown-trigger')
      if (dropdownTrigger) {
        dropdownTrigger.click()
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          id="share-dropdown-trigger"
          onClick={handleShare}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200" 
          aria-label="Share"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleCopyUrl}>
          <Copy className="mr-2 h-4 w-4" />
          Copy URL
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
          <Twitter className="mr-2 h-4 w-4" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare('linkedin')}>
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare('email')}>
          <Mail className="mr-2 h-4 w-4" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare('sms')}>
          <MessageCircle className="mr-2 h-4 w-4" />
          SMS
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

