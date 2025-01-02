"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Select, { MultiValue } from "react-select";
import { Button } from "./ui/button";
import { ChevronsUpDown, Search } from "lucide-react";

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

export default function TopicSelector({ onSearch }: { onSearch: any }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<
    MultiValue<{ value: number; label: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const { data, error } = await supabase
          .from("topics")
          .select("id, name")
          .order("name");

        if (error) throw error;

        setTopics(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching topics:", error);
        setError("Failed to load topics. Please try again later.");
        setIsLoading(false);
      }
    }
    fetchTopics();
  }, []);

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

  //   async function handleSearchTopics(e: React.FormEvent){
  //     console.log("CREATING NEW EVENT");
  //     e.preventDefault();
  //     console.log("Creating event:", {selectedTopics});

  //   const { data, error } = await supabase
  //     .from('topics') // Replace with your actual table name
  //     .select()
  //     .in('id', selectedTopics.map(topic => topic.value));

  //   if (error) {
  //     console.error('Error queried event:', error);
  //   } else {
  //     console.log('Events queried:', data);
  //   }

  //     setTopics([]);
  //   };

  const eventTypes = topics.map((topic: any) => ({
    value: topic.id,
    label: topic.name,
  }));

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    console.log("SEARCHING TOPICS");
    // e.preventDefault();
    console.log("Found Topics:", { selectedTopics });
    console.log(
      "searching for topic ids " + selectedTopics.map((topic) => topic.value)
    );

    const { data, error } = await supabase
      .from("pins") // Replace with your actual table name
      .select()
      .in(
        "topic_id",
        selectedTopics.map((topic) => topic.value)
      );

    if (error) {
      console.error("Error queried event:", error);
    } else {
      console.log("Events queried:", data);
    }
    // Pass the results to the parent component via the onSearch prop
    onSearch(data);
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
