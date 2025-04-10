"use client";

import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { SignInButton, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CommentsSectionProps {
  isOpen: boolean;
  onClose: () => void;
  pinId: number | null;
}

export default function CommentsSection({ isOpen, onClose, pinId }: CommentsSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const { user } = useUser();

  useEffect(() => {
    if (pinId) {
      fetchComments();
    }
  }, [pinId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, users(firstname, lastname)')
      .eq('pin_id', pinId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data || []);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pinId || !newComment.trim()) return;

    const { error } = await supabase
      .from('comments')
      .insert({
        pin_id: pinId,
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-center items-end bg-black bg-opacity-50 p-4 sm:p-6"
        >
          <motion.div
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
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h3 className="text-xl font-bold">Comments</h3>
              
              <div className="max-h-[60vh] overflow-y-auto space-y-4">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
} 