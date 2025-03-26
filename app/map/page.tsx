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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Siren,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { MultiValue } from "react-select";
import { createClient } from "@supabase/supabase-js";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CreatePinModal from "@/components/create-event-modal";
import CreateTopicModal from "@/components/create-topic-modal";
import DropdownSearch from "@/components/dropdown-search";
import { SignInButton, SignOutButton, useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Community coordinates
const COMMUNITY_COORDINATES = {
  "1": { // Columbia
    lat: 40.80793,
    lng: -73.9654486,
  },
  "2": { // NYC
    lat: 40.7128,
    lng: -74.0060,
  }
};

export default function Component() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<
    MultiValue<{ value: number; label: string }>
  >([]);
  const [queriedPins, setQueriedPins] = useState<any[]>([]);
  const [isCreatePinModalOpen, setIsCreatePinModalOpen] = useState(false);
  const [allTopicsList, setAllTopicsList] = useState<any[]>([]);
  const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [recEvent, setRecEvent] = useState<any>();
  const [likedPins, setLikedPins] = useState<any[]>([]);
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();
  const [selectedCommunity, setSelectedCommunity] = useState("1");
  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [showCarousel, setShowCarousel] = useState(false); // Show carousel of nearest pins

  // Disable scrolling when this component mounts
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Fetch data and handle query parameters
  useEffect(() => {
    const searchCommunity = searchParams.get('community');
    setSelectedCommunity(searchCommunity || "1");
    const params = new URLSearchParams(searchParams);
    replace(`${pathname.replace('/communities', '/map')}?${params.toString()}`);
    const newCenter = COMMUNITY_COORDINATES[searchCommunity as keyof typeof COMMUNITY_COORDINATES];
    if (newCenter) {
      setCenter(newCenter);
    }

    const fetchTopics = async () => {
      const { data, error } = await supabase.from("topics").select().eq("community_id", searchCommunity);
      if (error) {
        console.error("Error fetching topics:", error);
      } else {
        const allTopics = data.map((topic: any) => ({
          value: topic.id,
          label: topic.name,
        }));
        setAllTopicsList(allTopics);
      }
    };

    const fetchPins = async () => {
      const { data, error } = await supabase
        .from("pins")
        .select()
        .in("topic_id", [8, 6, 5, 7]);
      if (error) {
        console.error("Error fetching pins:", error);
      } else {
        setEvents(data);
      }
    };

    const fetchLikedPins = async () => {
      const { data, error } = await supabase.from("likes").select();
      if (error) {
        console.error("Error fetching liked pins:", error);
      } else {
        setLikedPins(data);
      }
    };

    fetchPins();
    fetchTopics();
    fetchLikedPins();
  }, [setAllTopicsList, replace, pathname, searchParams]);

  const handleSearchTopics = (data: any) => {
    console.log("=======================Database Found Topics:", data);
    setShowCarousel(true);
    setQueriedPins(data);
  };

  const handleCommunityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCommunity = event.target.value;
    setSelectedCommunity(newCommunity);
    const params = new URLSearchParams(searchParams);
    params.set('community', newCommunity);
    replace(`${pathname.replace('/communities', '/map')}?${params.toString()}`);

    // Update map center based on selected community
    const newCenter = COMMUNITY_COORDINATES[newCommunity as keyof typeof COMMUNITY_COORDINATES];
    if (newCenter) {
      setCenter(newCenter);
    }
  };

  return (
    // Don't allow scrolling
    <div className="relative h-screen overflow-hidden">
      <header className="absolute z-20 flex items-center px-4 lg:px-6 h-14 w-full bg-white shadow-md">
        <Link className="flex items-center justify-center rounded-md" href="#">
          <img src="/icons/pinpointLogo.png" alt="PinPoint Logo" className="w-6 h-6 rounded-md" />
          <span className="ml-2 text-2xl font-bold">PinPoint</span>
        </Link>
        <div className="community-selector ml-4">
          <select value={selectedCommunity} onChange={handleCommunityChange} className="rounded-md px-2 py-1">
            <option value="1">Columbia</option>
            <option value="2">NYC</option>
          </select>
        </div>
        <nav className="flex gap-4 ml-auto sm:gap-6">
          <Link href="https://forms.gle/QunyQ39XTjiFQmdZ7" className="text-sm font-medium text-blue-500 underline hover:text-blue-700">
            Feedback
          </Link>
          {!user ? (
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
          ) : (
            <SignOutButton />
          )}
        </nav>
      </header>

      {/* Overlay for TopicSearch */}
      <div className="absolute z-20 top-20 left-4 right-4">
        <TopicSearch onSearch={handleSearchTopics} />
      </div>

      <main className="relative h-full">
        {/* Full-screen map */}
        <div className="absolute inset-0 h-full w-full">
          <PinMap pins={queriedPins} center={center} showCarousel={showCarousel} setShowCarousel={setShowCarousel}/>
        </div>

        <CreatePinModal
          topics={allTopicsList}
          open={isCreatePinModalOpen}
          setOpen={setIsCreatePinModalOpen}
        />

        <CreateTopicModal
          open={isCreateTopicModalOpen}
          setOpen={setIsCreateTopicModalOpen}
        />

        {/* Floating Action Button (FAB) */}
        <div className="absolute bottom-4 right-2 z-30">
          <motion.div
            className="relative"
            initial={false}
            animate={isFabMenuOpen ? "open" : "closed"}
          >
            <motion.div
              className="flex flex-col items-center overflow-hidden rounded-full shadow-lg bg-primary text-primary-foreground mb-20"
              variants={{
                open: { height: "auto" },
                closed: { height: 56 },
              }}
            >
              <AnimatePresence>
                {isFabMenuOpen && (
                  <motion.div
                    className="flex flex-col py-2 space-y-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      className="p-2 text-white bg-blue-500 rounded-full"
                      onClick={() => setIsCreatePinModalOpen(!isCreatePinModalOpen)}
                    >
                      <MapPin size={20} />
                    </button>
                    <button
                      className="p-2 text-white bg-green-500 rounded-full"
                      onClick={() => setIsCreateTopicModalOpen(!isCreateTopicModalOpen)}
                    >
                      <FileText size={20} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button
                className="flex items-center justify-center p-4 rounded-full bg-primary text-primary-foreground"
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  if (!user) {
                    openSignIn();
                    return;
                  }
                  setIsFabMenuOpen(!isFabMenuOpen);
                }}
              >
                <motion.div
                  animate={{ rotate: isFabMenuOpen ? 225 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus size={24} />
                </motion.div>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* <div className="absolute right-4">
          <div className="relative flex items-end justify-center h-full pb-20">
            <motion.div
              className="relative"
              initial={false}
              animate={isFabMenuOpen ? "open" : "closed"}
            >
              <motion.div
                className="flex flex-col items-center overflow-hidden rounded-full shadow-lg bg-primary text-primary-foreground"
                variants={{
                  open: { height: "auto" },
                  closed: { height: 56 },
                }}
              >
                <AnimatePresence>
                  {isFabMenuOpen && (
                    <motion.div
                      className="flex flex-col py-2 space-y-2"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        className="p-2 text-white bg-blue-500 rounded-full"
                        onClick={() => setIsCreatePinModalOpen(!isCreatePinModalOpen)}
                      >
                        <MapPin size={20} />
                      </button>
                      <button
                        className="p-2 text-white bg-green-500 rounded-full"
                        onClick={() => setIsCreateTopicModalOpen(!isCreateTopicModalOpen)}
                      >
                        <FileText size={20} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.button
                  className="flex items-center justify-center p-4 rounded-full bg-primary text-primary-foreground"
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    if (!user) {
                      openSignIn();
                      return;
                    }
                    setIsFabMenuOpen(!isFabMenuOpen);
                  }}
                >
                  <motion.div
                    animate={{ rotate: isFabMenuOpen ? 225 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus size={24} />
                  </motion.div>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div> */}
      </main>
    </div>
  );
}
