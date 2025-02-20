"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import TopicSearch from "@/components/topic-search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PinMap from "@/components/ui/map";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from 'next/image';

import {
  MapPin,
  Plus,
  Search,
  ChevronUp,
  Calendar,
  Clock,
  FileText,
  ThumbsUp,
  TrendingUp,
  Sparkles,
  Code,
  Laptop,
  Palette,
  Book,
  Music,
  Camera,
  Dumbbell,
  ShowerHead,
  Siren
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { MultiValue } from "react-select";
import { createClient } from "@supabase/supabase-js";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
import { motion, AnimatePresence } from "framer-motion";
import CreatePinModal from "@/components/create-event-modal"; // Ensure this import is present
import CreateTopicModal from "@/components/create-topic-modal";
import DropdownSearch from "@/components/dropdown-search";
import { SignInButton, SignOutButton, useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";

const iconMappings = {
  1: "/assets/communities/columbia.png",
  2: "/assets/communities/nyc.jpg",
};

export default function Component() {
  const [allCommunitiesList, setAllCommunitiesList] = useState<any[] | null>([]);

  const { user } = useUser();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    console.log("RUN");
    const fetchCommunities = async () => {
      const { data, error } = await supabase.from("communities").select();
      if (error) {
      console.error(error);
      }
      console.log(data);
      setAllCommunitiesList(data);
  }
  fetchCommunities();
  }, []);

  console.log("REC EVENT");
  console.log(allCommunitiesList);
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Select Community</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allCommunitiesList?.map((community) => (
          <Card key={community?.id} className="flex flex-col">
            <CardHeader className="flex-row gap-4 items-center">
              <Image
                src={iconMappings[community.id as keyof typeof iconMappings] || "/placeholder.svg"}
                alt={community.name}
                width={50}
                height={50}
                className="rounded-full"
              />
              <div>
                <CardTitle>{community?.name}</CardTitle>
                {/* <CardDescription>{community.memberCount.toLocaleString()} members</CardDescription> */}
              </div>
            </CardHeader>
            <CardContent>
              <p>{community?.description}</p>
            </CardContent>
            <CardFooter className="mt-auto">
                <Button variant="default" onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set('community', community.id);
                    replace(`${pathname.replace('/communities', '/map')}?${params.toString()}`);
                }}>Join</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
