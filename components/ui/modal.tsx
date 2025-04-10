"use client"

import React, { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { X, ThumbsUp, ThumbsDown, MessageSquare, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClerk, useUser } from "@clerk/nextjs"
import { set } from 'zod'
import { ShareButton } from '../share-button'
import { Button } from '../ui/button'
import { SignInButton } from '@clerk/nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  name: string
  pin_id: number,
  event_name: string,
  event_desc: string,
}

interface CommentWithLikes {
  id: number;
  content: string;
  created_at: string;
  users: {
    firstname: string;
    lastname: string;
  };
  likes: number;
  userVote: 1 | -1 | 0;
}

export default function Component({ isOpen, onClose, title, description, name, pin_id, event_name, event_desc }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const { user } = useUser()
  const [likes, setLikes] = useState(0)
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0)
  const { openSignIn } = useClerk(); // Destructure openSignIn method
  const [comments, setComments] = useState<CommentWithLikes[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  console.log(user)
  useEffect(() => {
    // Fetch the current reaction of the user for this pin
    
    console.log("PIN IS ", pin_id);

    if (pin_id) {
      fetchLikes();
      if(user) {
        fetchUserReaction();
      }
    }

    

    
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

    if (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const handleVote = async (newUserVote: 1 | -1) => {
    const finalReaction = userVote === newUserVote ? 0 : newUserVote; // Toggle reaction
    // Optimistically update the UI: Update the userVote state immediately
    setUserVote(finalReaction);

    // Update the total likes (you can handle this based on your logic as well)
    // const updatedLikes = likes + (finalReaction === 1 ? 1 : finalReaction === -1 ? -1 : 0);
    const updatedLikes = likes + (userVote === 1 ? finalReaction - 1 : userVote === -1 ? finalReaction + 1 : finalReaction);
    setLikes(updatedLikes); // Update the UI immediately

    // Upsert the reaction (insert or update the user's reaction)
    const { data, error } = await supabase
      .from('likes')
      .upsert({
        user_id: user?.id,
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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pin_id || !newComment.trim()) return;

    const { error } = await supabase
      .from('comments')
      .insert({
        pin_id: pin_id,
        user_id: user.id,
        content: newComment.trim()
      });

    if (error) {
      console.error('Error posting comment:', error);
    } else {
      setNewComment('');
      fetchComments();
    }
  };

  const handleComment = () => {
    setShowComments(!showComments);
  }

  useEffect(() => {
    if (pin_id && showComments) {
      fetchComments();
    }
  }, [pin_id, showComments]);

  const fetchComments = async () => {
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*, users(firstname, lastname), vote_type')
      .eq('pin_id', pin_id)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return;
    }

    // Get user's votes for comments if logged in
    const commentsWithLikes = await Promise.all(commentsData!.map(async (comment) => {
      let userVote = 0;
      if (user) {
        const { data: userVoteData } = await supabase
          .from('comments')
          .select('vote_type')
          .eq('id', comment.id)
          .eq('user_id', user.id)
          .maybeSingle();

        userVote = userVoteData?.vote_type || 0;
      }

      return {
        ...comment,
        likes: comment.vote_type || 0,
        userVote: userVote as 1 | -1 | 0
      };
    }));

    setComments(commentsWithLikes);
  };

  const handleCommentVote = async (commentId: number, newVote: 1 | -1) => {
    if (!user) {
      openSignIn();
      return;
    }

    // Find the comment
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    // Calculate final vote (toggle if same vote)
    const finalVote = comment.userVote === newVote ? 0 : newVote;

    // Optimistically update UI
    setComments(comments.map(c => {
      if (c.id === commentId) {
        const likeDiff = finalVote - c.userVote;
        return {
          ...c,
          likes: c.likes + likeDiff,
          userVote: finalVote
        };
      }
      return c;
    }));

    // Update database
    const { error } = await supabase
      .from('comments')
      .update({ vote_type: finalVote })
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error saving comment vote:', error);
      // Revert optimistic update on error
      fetchComments();
    }
  };

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
          <div className="flex flex-col gap-4 w-full max-w-lg">
            {/* Main Modal Content */}
            <motion.div
              ref={modalRef}
              initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full bg-white shadow-2xl rounded-2xl overflow-hidden"
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
                    <span className="text-gray-900">{name}</span>
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={async () => {
                        if (!user) {
                          openSignIn();
                          return;
                        }
                        handleVote(1);
                      }}
                      className={`p-2 rounded-full ${userVote === 1 ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                      aria-label="Upvote"
                    >
                      <ThumbsUp className="h-5 w-5" />
                    </button>
                    <span className="font-semibold text-lg" aria-live="polite">{likes}</span>
                    <button
                      onClick={async () => {
                        if (!user) {
                          openSignIn();
                          return;
                        }
                        handleVote(-1);
                      }}
                      className={`p-2 rounded-full ${userVote === -1 ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
                      aria-label="Downvote"
                    >
                      <ThumbsDown className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!user) {
                          openSignIn();
                          return;
                        }
                        handleComment();
                      }}
                      className={`p-2 rounded-full hover:bg-gray-100 ${showComments ? 'bg-blue-100 text-blue-600' : ''}`}
                      aria-label="Comment"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                    <ShareButton
                      title="Check out this awesome page!"
                      description="I found this great website and thought you might like it too."
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Comments Section */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="w-full bg-white shadow-2xl rounded-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative p-6 space-y-4">
                    <h3 className="text-xl font-bold">Comments</h3>
                    
                    <div className="max-h-[40vh] overflow-y-auto space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border-b pb-3">
                          <div className="flex justify-between items-start">
                            <p className="font-semibold">
                              {comment.users?.firstname} {comment.users?.lastname}
                            </p>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-1 text-gray-600">{comment.content}</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <button
                              onClick={() => handleCommentVote(comment.id, 1)}
                              className={`p-1 rounded-full ${comment.userVote === 1 ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                              aria-label="Upvote comment"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-semibold">{comment.likes}</span>
                            <button
                              onClick={() => handleCommentVote(comment.id, -1)}
                              className={`p-1 rounded-full ${comment.userVote === -1 ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
                              aria-label="Downvote comment"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {user ? (
                      <form onSubmit={handleSubmitComment} className="mt-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <Button type="submit" disabled={!newComment.trim()}>
                            Post
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="text-center p-4">
                        <p>Please sign in to comment</p>
                        <SignInButton mode="modal">
                          <Button className="mt-2">Sign In</Button>
                        </SignInButton>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}