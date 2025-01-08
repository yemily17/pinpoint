"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Select, { MultiValue } from "react-select";
import { Button } from "./ui/button";
import { ChevronsUpDown, Search } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Topic {
  id: number;
  name: string;
  // Add any other fields that exist in your topics table
}

export default function TopicSelector({ onSearch, prefilledTopics }: { onSearch: any, prefilledTopics?: MultiValue<{ value: number; label: string }> }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<
    MultiValue<{ value: number; label: string }>
  >(prefilledTopics??[]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  useEffect(() => {
    const allTopics = fetchTopics();
    const topicParam = searchParams.get('topic');
    console.log("ALL TOPICS", allTopics);
    // if (topicParam) {
    //   console.log("Found topic in search params:", topicParam);
    //   const topicNames = allTopics
    //     .filter((topic) => topic.id === parseInt(topicParam))
    //     .map((topic) => topic.name);
    //   console.log("Found topic names:", topicNames);
    //   handleChange([{ value: parseInt(topicParam), label: topicNames[0] }]);
    // }

    // if(prefilledTopics){
    //   handleChange(prefilledTopics);
    // }
  }, []);

  async function fetchTopics() {
    try {
      const { data, error } = await supabase
        .from("topics")
        .select("id, name")
        .order("name");

      if (error) throw error;

      setTopics(data);
      setIsLoading(false);

      const topicParam = searchParams.get('topic');
      if (topicParam) {
        console.log("Found topic in search params:", topicParam);
        const topicNames = data
          .filter((topic) => topic.id === parseInt(topicParam))
          .map((topic) => topic.name);
        console.log("Found topic names:", topicNames);
        handleChange([{ value: parseInt(topicParam), label: topicNames[0] }]);
        console.log("Selected topics", selectedTopics);
        handleSubmit({ preventDefault: () => {} }, [{ value: parseInt(topicParam), label: topicNames[0] }] );
      }
      return data;
    } catch (error) {
      console.error("Error fetching topics:", error);
      setError("Failed to load topics. Please try again later.");
      setIsLoading(false);
      return error;
    }
  }
  const handleChange = (
    selectedOptions: MultiValue<{ value: number; label: string }>
  ) => {
    setSelectedTopics(selectedOptions);
    console.log("SELECTED TOPICS", selectedOptions);
  };

  if (isLoading) {
    return <div className="text-center">Loading topics...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const options = topics.map((topic) => ({
    value: topic.id,
    label: topic.name,
  }));

  const eventTypes = topics.map((topic: any) => ({
    value: topic.id,
    label: topic.name,
  }));

  async function handleSubmit(e: { preventDefault: () => void }, prefillTopics?: MultiValue<{ value: number; label: string }>) {
    console.log(e);
    e.preventDefault();
    console.log("SEARCHING TOPICS");
    // if(prefillTopics){
    //   const searchTopics = 
    // }
    console.log(prefillTopics);
    const searchTopics = prefillTopics??selectedTopics;
    // e.preventDefault();
    console.log("Found Topics:", { searchTopics });
    console.log(
      "searching for topic ids " + searchTopics.map((topic) => topic.value)
    );

    const res = await fetchPinsByTopicIds(searchTopics.map((topic) => topic.value));
    if(res.data){
      console.log("Events queried:", res.data);
    }
    if (res.error) {
      console.error("Error queried event:", res.error);
    }
    // Pass the results to the parent component via the onSearch prop
    onSearch(res.data);
  }

  async function fetchPinsByTopicIds(topicIds: number[]) {
    const { data, error } = await supabase
      .from("pins") // Replace with your actual table name
      .select()
      .in("topic_id", topicIds);

    if (error) {
      return { error };
    } else {
      return { data };
    }
  }

  async function fetchTopicNamesByTopicIds(topicIds: number[]) {
    const { data, error } = await supabase
      .from("topics") // Replace with your actual table name
      .select("")
      .in("topic_id", topicIds);

    if (error) {
      return { error };
    } else {
      return { data };
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="w-full mt-4 max-w-md mx-auto flex items-center justify-between">
        <Select
          isMulti
          closeMenuOnSelect={false}
          options={options}
          value={selectedTopics}
          onChange={handleChange}
          className="basic-multi-select flex-grow"
          classNamePrefix="select"
          placeholder="Select topics..."
          aria-label="Select topics"
          // styles={{
          //   dropdownIndicator: (base) => ({
          //     ...base,
          //     color: 'red', // Change the color of the arrow
          //     ':hover': {
          //       color: 'blue' // Change the color on hover
          //     }
          //   })
          // }}
          // components={{ DropdownIndicator:() => null, IndicatorSeparator:() => null }}
        />
        <Button type="submit" className="ml-4">
          <Search className="h-5 w-5 text-gray-400" />
        </Button>
      </div>
    </form>
  );
}
