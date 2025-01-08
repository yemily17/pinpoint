"use client";

import { useState, Dispatch, SetStateAction, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { CommandList } from "cmdk";
import { cn } from "@/utils/cn";
import { useUser } from "@clerk/nextjs";
import {
  GoogleMap,
  LoadScript,
  Marker,
  useLoadScript,
} from "@react-google-maps/api";
import PinMap from "./ui/map";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";

export default function CreatePinModal({
  topics,
  open,
  setOpen,
}: {
  topics: any;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const center = {
    lat: 40.7128,
    lng: -74.006,
  };

  const [pinName, setPinName] = useState("");
  const [pinType, setPinType] = useState("");
  const [pinDescription, setPinDescription] = useState("");
  const [location, setLocation] = useState(center);
  const [dateTime, setDateTime] = useState<Date | null>(null);

  const { user } = useUser();

  const mapRef = useRef(null);

  const mapContainerStyle = {
    width: "100%",
    height: "400px",
  };

  const onMapLoad = useCallback((map: any) => {
    mapRef.current = map;
  }, []);

  const onMapClick = useCallback((e: any) => {
    setLocation({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  }, []);

  async function handleCreatePin(e: React.FormEvent) {
    e.preventDefault();
    console.log("Creating pin:",  {
      name: pinName,
      description: pinDescription,
      topic_id: pinType,
      latitude: location.lat,
      longitude: location.lng,
      user_id: user?.id,
      date: dateTime?.toISOString()
    },);

    

    const { data, error } = await supabase.from("pins").insert([
      {
        name: pinName,
        description: pinDescription,
        topic_id: pinType,
        latitude: location.lat,
        longitude: location.lng,
        user_id: user?.id,
        datetime: dateTime?.toISOString()
      },
    ]);

    if (error) {
      console.error("Error adding pin:", error);
    } else {
      console.log("Pin added successfully:", data);
      console.log(error)
    }

    setPinName("");
    setPinType("");
    setPinDescription("");
    setLocation(center);
    setOpen(false);
    router.refresh();
  }

  // const { isLoaded, loadError } = useLoadScript({
  //   id: `google-map`,
  //   googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  //   libraries: ["places"],
  // });

  const router = useRouter();

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-in-out ${
        open ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-background border-t border-border rounded-t-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add Pin</h2>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            &times;
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          Enter the details for your new pin and select its location on the map.
          Click create when you're done.
        </p>
        <form onSubmit={handleCreatePin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin-name">Name</Label>
            <Input
              id="pin-name"
              value={pinName}
              onChange={(e) => setPinName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin-type">Topic</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !pinType && "text-muted-foreground"
                  )}
                >
                  {pinType
                    ? topics?.find((type: any) => type?.value === pinType)
                        ?.label
                    : "Select pin topic"}
                  <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search pin topic..." />
                  <CommandEmpty>No pin category found.</CommandEmpty>
                  <CommandList>
                    {topics?.map((type: any) => (
                      <CommandItem
                        key={type?.value}
                        onSelect={() => {
                          setPinType(
                            type?.value === pinType ? "" : type?.value
                          );
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            pinType === type?.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {type?.label}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin-description">Description</Label>
            <Input
              id="pin-description"
              value={pinDescription}
              onChange={(e) => setPinDescription(e.target.value)}
              placeholder="Enter pin description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin-date-time">Date and Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateTime && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTime ? dateTime.toLocaleString() : "Select date and time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <DatePicker
                  selected={dateTime}
                  onChange={(date) => setDateTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  inline
                />
              </PopoverContent>
            </Popover>
          </div>
          <Label className="text-right mt-2">Location</Label>
          <div className=" items-center ">
            
            <div className="w-full">
              <PinMap pins={[]} style={mapContainerStyle} onMapClick={onMapClick} location={location} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Coordinates</Label>
            <p className="text-sm text-muted-foreground">
              Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
            </p>
          </div>
          <Button type="submit" className="w-full">
            Create Pin
          </Button>
        </form>
      </div>
    </div>
  );
}
