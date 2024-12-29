"use client";

import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarPlus } from "lucide-react";
import { SignInButton, useUser } from '@clerk/nextjs';

export default function CreateTopicModal({ open, setOpen }: { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const user = useUser();

  const [topicName, setTopicName] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Simulating user authentication
  // useEffect(() => {
  //   // This is a placeholder. In a real app, you'd check the user's auth status here.
  //   setUserId("example-user-id");
  // }, []);

  async function handleCreateTopic(e: React.FormEvent) {
    e.preventDefault();
    console.log("Creating new topic");

    if (!userId) {
      console.error('User not authenticated');
      return <SignInButton />;
    }

    const { data, error } = await supabase
      .from('topics')
      .insert([
        {
          name: topicName,
          description: topicDescription,
          user_id: userId,
        }
      ]);

    if (error) {
      console.error('Error adding topic:', error);
    } else {
      console.log('Topic added successfully:', data);
    }

    // Reset form and close modal
    setTopicName("");
    setTopicDescription("");
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" onClick={() => {
          // if (!user) {
          //   window.location.href = '/sign-in';
          // } else {
            setOpen(true);
          // }
        }}>
        <CalendarPlus className="mr-2 h-4 w-4" />
        Create Topic
      </Button>

      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-in-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-background border-t border-border rounded-t-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Create New Topic</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              &times;
            </Button>
          </div>
          <p className="text-muted-foreground mb-6">
            Fill in the details for your new topic. Click save when you're done.
          </p>
          <form onSubmit={handleCreateTopic} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic-name">Name</Label>
              <Input
                id="topic-name"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="Enter topic name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic-description">Description</Label>
              <Input
                id="topic-description"
                value={topicDescription}
                onChange={(e) => setTopicDescription(e.target.value)}
                placeholder="Enter topic description"
              />
            </div>
            <Button type="submit" className="w-full">
              Save Topic
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}