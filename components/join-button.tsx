'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"

interface JoinButtonProps {
  communityId: string;
  initialMemberCount: number;
}

export function JoinButton({ communityId, initialMemberCount }: JoinButtonProps) {
  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(initialMemberCount);

  const handleJoin = async () => {
    // In a real application, you'd call an API to join the community
    // For this example, we'll just toggle the state
    setIsJoined(!isJoined);
    setMemberCount(isJoined ? memberCount - 1 : memberCount + 1);
  }

  return (
    <Button 
      onClick={handleJoin} 
      variant={isJoined ? "secondary" : "default"}
    >
      {isJoined ? 'Leave' : 'Join'} • {memberCount.toLocaleString()}
    </Button>
  )
}

