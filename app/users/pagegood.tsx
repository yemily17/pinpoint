"use client";

import { JoinButton } from '../../components/join-button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image'
import { useEffect, useState } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function Component() {
    const [allCommunitiesList, setAllCommunitiesList] = useState<any[] | null>([null]);
    
    useEffect(() => {
        const fetchCommunities = async () => {
            const { data, error } = await supabase.from("communities").select();
            if (error) {
            console.error(error);
            }
            setAllCommunitiesList(data);
        }
        fetchCommunities();
      }, []);
    
      console.log(allCommunitiesList);

    

//   const communities = [
//     {
//       id: '1',
//       name: 'Tech Enthusiasts',
//       description: 'A community for those passionate about the latest in technology.',
//       photoUrl: '/placeholder.svg?height=100&width=100',
//       memberCount: 5000
//     },
//     {
//       id: '2',
//       name: 'Foodies Unite',
//       description: 'Share recipes, restaurant recommendations, and all things food!',
//       photoUrl: '/placeholder.svg?height=100&width=100',
//       memberCount: 3500
//     },
//     {
//       id: '3',
//       name: 'Fitness Fanatics',
//       description: 'Get fit together! Share workout tips, progress, and motivation.',
//       photoUrl: '/placeholder.svg?height=100&width=100',
//       memberCount: 2800
//     },
//     // Add more mock communities as needed
//   ]

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Join Communities</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allCommunitiesList?.map((community) => (
          <Card key={community.id} className="flex flex-col">
            <CardHeader className="flex-row gap-4 items-center">
              <Image
                src={community.photoUrl || "/placeholder.svg"}
                alt={community.name}
                width={50}
                height={50}
                className="rounded-full"
              />
              <div>
                <CardTitle>{community.name}</CardTitle>
                {/* <CardDescription>{community.memberCount.toLocaleString()} members</CardDescription> */}
              </div>
            </CardHeader>
            <CardContent>
              <p>{community.description}</p>
            </CardContent>
            <CardFooter className="mt-auto">
              {/* <JoinButton communityId={community.id} initialMemberCount={community.memberCount} /> */}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

