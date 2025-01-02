"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TopicSearch from "@/components/topic-search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Map from "@/components/ui/map";
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
import { useSearchParams } from "next/navigation";

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

export default function Component() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<
    MultiValue<{ value: number; label: string }>
  >([]);
  const [queriedPins, setQueriedPins] = useState<any[]>([]);
  const [isCreatePinModalOpen, setIsCreatePinModalOpen] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [recEvent, setRecEvent] = useState<any>();
  const [likedPins, setLikedPins] = useState<any[]>([]);
  const { openSignIn } = useClerk(); // Destructure openSignIn method
  const { user } = useUser();

  const interests = [
    {
      icon: ShowerHead,
      label: "Bathrooms",
      gradient: "from-blue-500 to-cyan-500",
      id: 1,
    },
    {
      icon: Siren,
      label: "Police",
      gradient: "from-red-500 to-rose-500",
    },
    

  ];

  const trendingEvents = [
    {
      id: 5,
      title: "Fashion Week",
      location: "Paris, France",
      date: "2023-09-25",
      time: "02:00 PM",
      color: "bg-pink-50",
    },
    {
      id: 6,
      title: "Gaming Convention",
      location: "Los Angeles, CA",
      date: "2023-10-10",
      time: "10:00 AM",
      color: "bg-indigo-50",
    },
  ];

  const [activeTab, setActiveTab] = useState("recommended");

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
    console.log("Database Found Topics:", data);
    setQueriedPins(data);
  }
  // console.log(isCreatePinModalOpen)

  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase.from("topics").select();

      if (error) {
        console.error("Error fetching topics:", error);
      } else {
        const eventTypes = data.map((topic: any) => ({
          value: topic.id,
          label: topic.name,
        }));

        setTopics(eventTypes);
      }
    };

    useEffect(() => {
      // const { pinId, topicName } = useSearchParams();
      const searchParams = useSearchParams()
      console.log(searchParams)
    
      // if (pinId && topicName) {
      //   // Fetch the pin based on the URL parameters and open the modal
      //   const pin = pins.find(p => p.id === pinId && p.topicName === topicName);
      //   if (pin) {
      //     setSelectedPin(pin);
      //     setModalOpen(true);
      //     setCenter({ lat: pin.latitude, lng: pin.longitude });
      //   }
      // }
    }, []);
    // }, [router.query, pins]);

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
  }, [setTopics]);

  console.log("REC EVENT");
  console.log(recEvent);
  return (
    <div className="flex flex-col h-screen">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-primary text-primary-foreground">
        <h1 className="text-xl font-bold">PINPOINT</h1>
        {!user ? (
              <SignInButton mode="modal">
                <Button >Sign In</Button>
              </SignInButton>
            ) : (
              <SignOutButton />
            )}
      </header>
      <div className="absolute z-10 top-20 left-4 right-4">
        <div className="relative">
          
          <TopicSearch onSearch={handleSearchTopics} />
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
          <Map pins={queriedPins} />
        </div>

        <CreatePinModal
          topics={topics} // Ensure topics is defined or passed correctly
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
        <div
          className={`absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-lg transition-transform duration-300 ease-in-out transform ${
            isMenuOpen ? "translate-y-0" : "translate-y-[calc(100%-2.5rem)]"
          } z-20`}
        >
          <div
            className="flex justify-center p-2 cursor-pointer"
            onClick={async () => {
              setIsMenuOpen(!isMenuOpen);
              console.log("made request for refc");
              const response = await fetch("/api/rec", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  eventHistory: likedPins.filter(
                    (pin) => pin.user_id === user?.id
                  ),
                  allEvents: events,
                }),
              });
              const data = await response.json();
              setRecEvent(JSON.parse(data));
              console.log("RECEIVED RECOMMENDATION");
              console.log(data);
            }}
          >
            <ChevronUp
              className={`h-6 w-6 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
            />
          </div>
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <div className="w-full max-w-md mx-auto p-4 bg-background">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="recommended" className="text-xs py-2">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    For You
                  </TabsTrigger>
                  <TabsTrigger value="upcoming" className="text-xs py-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    Upcoming
                  </TabsTrigger>
                  <TabsTrigger value="trending" className="text-xs py-2">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Trending
                  </TabsTrigger>
                </TabsList>
                <div className="max-h-[calc(100vh-160px)] overflow-y-auto px-1">
                  <TabsContent value="recommended">
                    <h2 className="mb-4 text-xl font-bold flex items-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Recommended for you
                    </h2>
                    {/* {renderEvents(recommendedEvents)} */}
                    <h1 className="mb-3">{recEvent?.event.reason}</h1>
                    {recEvent !== undefined ? (
                      renderEvents([
                        {
                          title: recEvent?.event.name,
                          location: recEvent?.event.location,
                          date: recEvent?.event.date,
                          time: recEvent?.event.time,
                          color: "bg-purple-50",
                        },
                      ])
                    ) : (
                      <h1>Loading...</h1>
                    )}
                  </TabsContent>
                  <TabsContent value="upcoming">
                    <h2 className="mb-4 text-xl font-bold flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Upcoming Events
                    </h2>
                    {renderEvents(
                      events.slice(0, 2).map((event, index) => {
                        return {
                          title: event.name,
                          location: event.latitude + ", " + event.longitude,
                          date:
                            event.datetime !== null
                              ? event.datetime!.split("T")[0]
                              : "N/A",
                          time:
                            event.datetime !== null
                              ? event.datetime!.split("T")[1]
                              : "N/A",
                          color: index === 0 ? "bg-green-50" : "bg-yellow-50",
                        };
                      })
                    )}
                  </TabsContent>
                  <TabsContent value="trending">
                    <h2 className="mb-4 text-xl font-bold flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Trending
                    </h2>
                    {renderEvents(trendingEvents)}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
