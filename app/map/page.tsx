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
  Siren
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { MultiValue } from "react-select";
import { createClient } from "@supabase/supabase-js";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  const { openSignIn } = useClerk(); // Destructure openSignIn method
  const { user } = useUser();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();
  const [selectedCommunity, setSelectedCommunity] = useState("1");

  console.log("liked pins");
  console.log(likedPins.filter((pin) => pin.user_id === user?.id));
  const renderEvents = (events: any[]) => (
    <div className="space-y-4">
      {events.map((event: any) => (
        <Card key={event.id} className={`overflow-hidden ${event.color}`}>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg font-semibold">
              {event.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {event.location}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <Calendar className="w-4 h-4 mr-2" />
              {event.date}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" />
              {event.time}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  async function handleSearchTopics(data: any) {
    // console.log("SEARCHING TOPICS");
    // e.preventDefault();
    console.log("=======================Database Found Topics:", data);
    setQueriedPins(data);
  }
  // console.log(isCreatePinModalOpen)
  // useEffect(() => {
  //   // const { pinId, topicName } = useSearchParams();
  //   const searchParams = useSearchParams()
  //   console.log(searchParams)
  
    // if (pinId && topicName) {
    //   // Fetch the pin based on the URL parameters and open the modal
    //   const pin = pins.find(p => p.id === pinId && p.topicName === topicName);
    //   if (pin) {
    //     setSelectedPin(pin);
    //     setModalOpen(true);
    //     setCenter({ lat: pin.latitude, lng: pin.longitude });
    //   }
    // }
  // }, []);
  // }, [router.query, pins]);
  const handleCommunityChange = (event) => {
    setSelectedCommunity(event.target.value);
    const params = new URLSearchParams(searchParams);
                  params.set('community', event.target.value);
                    replace(`${pathname.replace('/communities', '/map')}?${params.toString()}`);
    // Fetch and update topics based on the new community
  };
  useEffect(() => {
    const searchTopic = searchParams.get('topic');
    const searchPin = searchParams.get('pin');
    const fetchTopics = async () => {
      const { data, error } = await supabase.from("topics").select();

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
  }, [setAllTopicsList]);

  console.log("REC EVENT");
  console.log(recEvent);
  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center px-4 lg:px-6 h-14">
          <Link className="flex items-center justify-center" href="#">
        <MapPin className="w-6 h-6 text-primary" />
        <span className="ml-2 text-2xl font-bold">PinPoint</span>
          </Link>
          <div className="community-selector ml-4">
        <select
          value={selectedCommunity}
          onChange={handleCommunityChange}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="1">Columbia</option>
          <option value="2">NYC</option>
        </select>
          </div>
          <nav className="flex gap-4 ml-auto sm:gap-6">
        {!user ? (
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        ) : (
          <SignOutButton />
        )}
          </nav>
        </header>
      <div className="absolute z-10 top-20 left-4 right-4">
        <div className="relative">
          
          <TopicSearch onSearch={handleSearchTopics}/>
          {/* <div className="flex flex-wrap justify-center gap-4 ">
            {interests.map((interest, index) => (
              <Button
                key={index}
                variant="outline"
                className={`flex items-center gap-2 w-28 text-sm mt-4  justify-center bg-gradient-to-r ${interest.gradient} text-white border-none hover:opacity-80 transition-opacity`}
              >
                <interest.icon className="w-4 h-4" />
                <span>{interest.label}</span>
              </Button>
            ))}
          </div> */}
          {/* <DropdownSearch /> */}
        </div>
      </div>
      <main className="relative flex-1">
        {/* Map component */}
        <div className="absolute inset-0 h-screen">
          <PinMap pins={queriedPins} />
        </div>

        <CreatePinModal
          topics={allTopicsList} // Ensure topics is defined or passed correctly
          open={isCreatePinModalOpen}
          setOpen={setIsCreatePinModalOpen}
        />

        <CreateTopicModal
          open={isCreateTopicModalOpen}
          setOpen={setIsCreateTopicModalOpen}
        />

        {/* <div className="absolute z-10 top-20 left-4 right-4">
          <div className="relative">
            <Slider
              className="absolute"
              defaultValue={[33]}
              max={100}
              step={1}
            />
          </div>
        </div> */}

        {/* Floating Action Button (FAB) for adding new events */}
        <div className="absolute right-4">
          <div className="relative flex items-end justify-center h-screen pb-20">
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
                        onClick={() =>
                          setIsCreatePinModalOpen(!isCreatePinModalOpen)
                        }
                      >
                        <MapPin size={20} />
                      </button>
                      <button
                        className="p-2 text-white bg-green-500 rounded-full"
                        onClick={() =>
                          setIsCreateTopicModalOpen(!isCreateTopicModalOpen)
                        }
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
          {/* <Button
            className="rounded-full shadow-lg"
            size="icon"
            onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          >
            <Plus className="w-6 h-6" />
            <span className="sr-only">Add New Event</span>
          </Button> */}
        </div>

        {/* Slide-up menu */}
      </main>
    </div>
  );
}
