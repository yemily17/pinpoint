"use client"

import React, { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { X, ThumbsUp, ThumbsDown, MessageSquare, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from "@clerk/nextjs"
import { set } from 'zod'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  firstname: string
  lastname: string
  pin_id: number,
  event_name: string,
  event_desc: string,
}

export default function Component({ isOpen, onClose, title, description, firstname, lastname, pin_id, event_name, event_desc }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const { user } = useUser()
  const [likes, setLikes] = useState(0)
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0)


  console.log(user)
  useEffect(() => {
    // Fetch the current reaction of the user for this pin
    const fetchUserReaction = async () => {
      if (user) {
        // if (!pin_id) return;
        console.log("Fetching user reaction");
        console.log("user.id", user.id);
        console.log("pin_id", pin_id);
        console.log("event_name", event_name);
        const { data, error } = await supabase
          .from('likes')
          .select('vote_type')
          .eq('user_id', user.id)
          .eq('pin_id', pin_id)
          .maybeSingle();
// Handle error or no data found (if no reaction exists)
if (error) {
  console.error('Error fetching user reaction:', error);
  return; // You can handle this however you'd like
}
          if (!data) {
            console.log("No reaction found");
            setUserVote(0); // No vote has been cast yet
          } else {
            setUserVote(data.vote_type); // Store the user's reaction (1 or -1)
          }
      }
    };

    if (user) {
      fetchUserReaction();
    }

    const fetchLikes = async () => {
      const { data, error } = await supabase
        .from('likes')
        .select('vote_type')
        .eq('pin_id', pin_id);

      if (data) {
        const totalLikes = data.reduce((sum, vote_type) => sum + vote_type.vote_type, 0);
        console.log("totalLikes", totalLikes);
        setLikes(totalLikes);
      }
    };

    fetchLikes();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'visible'
    }
  }, [pin_id, isOpen, onClose])

  const handleVote = async (newUserVote: 1 | -1) => {
    //if uservote is 1 subtract 1 
    //if uservote is -1 add 1

    // 1 0, 1 1 --> 0 1 X
    // 1, -1 --> -1 X
    // -2 final minus 1

      // 1 0, 0 0 --> 0 0
      // 1, 1 --> 0
      // -1 final minus 1

    // 0 1, 1 1 --> 1 0 X
    // -1, 1 --> 1 X
    // +2 final plus 1

      // 0 1, 0 0 --> 0 0
      // -1, -1 --> 0 
      // +1 final plus 1

      // 0 0, 1 0 --> 1 0
      // 0, 1 --> 1
      // 1 final

      // 0 0, 0 1 --> 0 1
      // 0, -1 --> -1
      // -1 final

    // if (userVote === newUserVote) {
    //   const finalReaction = 0;
    // } else{
    //   const finalReaction = newUserVote;
    const finalReaction = userVote === newUserVote ? 0 : newUserVote; // Toggle reaction
    console.log("FINAL REACTION IS ", finalReaction);
    // Optimistically update the UI: Update the userVote state immediately
  setUserVote(finalReaction);

  // Update the total likes (you can handle this based on your logic as well)
  // const updatedLikes = likes + (finalReaction === 1 ? 1 : finalReaction === -1 ? -1 : 0);
  const updatedLikes = likes + (userVote === 1 ? finalReaction - 1 : userVote === -1 ? finalReaction + 1 : finalReaction );
  setLikes(updatedLikes); // Update the UI immediately

    // Upsert the reaction (insert or update the user's reaction)
    const { data, error } = await supabase
      .from('likes')
      .upsert({
        user_id: user.id,
        pin_id: pin_id,
        vote_type: finalReaction,
        event_name: event_name,
        event_desc: event_desc
      }, { onConflict: 'user_id, pin_id' });

    if (error) {
      console.error('Error saving reaction:', error);
      return;
    }
    // setUserVote(finalReaction); // Update the user's reaction in the UI
    // setLikes((prevLikes) => prevLikes + finalReaction);

    // Here you would typically update the vote in your database
    // For example:
    // await supabase.from('votes').upsert({ user_id: user?.id, pin_id, vote_type: voteType })
  }

  const handleComment = () => {
    // Implement comment functionality
    console.log('Comment clicked')
  }

  const handleShare = () => {
    // Implement share functionality
    console.log('Share clicked')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-center items-end bg-black bg-opacity-50 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-white shadow-2xl rounded-t-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-6 space-y-4">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 leading-tight" id="modal-title">
                  {title}
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  {description}
                </p>
              </div>
              <div className="pt-2">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Created By:</span>{' '}
                  <span className="text-gray-900">{firstname} {lastname}</span>
                </p>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleVote(1)}
                    className={`p-2 rounded-full ${userVote === 1 ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                    aria-label="Upvote"
                  >
                    <ThumbsUp className="h-5 w-5" />
                  </button>
                  <span className="font-semibold text-lg" aria-live="polite">{likes}</span>
                  <button
                    onClick={() => handleVote(-1)}
                    className={`p-2 rounded-full ${userVote === -1 ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
                    aria-label="Downvote"
                  >
                    <ThumbsDown className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <button onClick={handleComment} className="p-2 rounded-full hover:bg-gray-100" aria-label="Comment">
                    <MessageSquare className="h-5 w-5" />
                  </button>
                  <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-100" aria-label="Share">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}