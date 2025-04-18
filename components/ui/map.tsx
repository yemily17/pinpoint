import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { createClient } from "@supabase/supabase-js";
import Modal from "./modal"; // Import your Modal component
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import CommentsSection from "@/components/comments-section";
import NearestPinsCarousel from "./nearestpinscarousel";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const iconMappings = {
  1: {
    normal: "/assets/topics/bathroom.svg",
    highlighted: "/assets/topics/bathroom-red.svg"
  },
  2: {
    normal: "/assets/topics/wheelchair.svg",
    highlighted: "/assets/topics/wheelchair-red.svg"
  },
  3: {
    normal: "/assets/topics/police.svg",
    highlighted: "/assets/topics/police-red.svg"
  },
  5: {
    normal: "/assets/topics/food.svg",
    highlighted: "/assets/topics/food-red.svg"
  },
  27: {
    normal: "/assets/topics/gym.svg",
    highlighted: "/assets/topics/gym-red.svg"
  },
  8: {
    normal: "/assets/topics/world.svg",
    highlighted: "/assets/topics/world-red.svg"
  },
  9: {
    normal: "/assets/topics/wifi.svg",
    highlighted: "/assets/topics/wifi-red.svg"
  },
  10: {
    normal: "/assets/topics/water.svg",
    highlighted: "/assets/topics/water-red.svg"
  },
  11: {
    normal: "/assets/topics/farmers-market.svg",
    highlighted: "/assets/topics/farmers-market-red.svg"
  },
  12: {
    normal: "/assets/topics/book.svg",
    highlighted: "/assets/topics/book-red.svg"
  },
  18: {
    normal: "/assets/topics/pawprintLogo.svg",
    highlighted: "/assets/topics/pawprintLogo-red.svg"
  },
  23: {
    normal: "/assets/topics/flex.png",
    highlighted: "/assets/topics/flex.png"  // Keep original for PNG files
  },
  24: {
    normal: "/assets/topics/vendingMachine.svg",
    highlighted: "/assets/topics/vendingMachine-red.svg"
  },
};

const containerStyle = {
  width: "100%",
  height: "100%",
};

const initCenter = {
  lat: 40.80793,
  lng: -73.9654486,
};

const mapStyles = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "#f5f2e9" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#b2e0ff" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f7f2e6" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e1f7d5" }, { visibility: "on" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#f5f2e5" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7b6f5c" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }, { weight: 2 }],
  },
];

export default function PinMap({
  pins,
  onMapClick,
  location,
  style,
  openedPin,
  center: propCenter,
  showCarousel,
  setShowCarousel,
}: {
  pins: any[];
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
  location?: google.maps.LatLngLiteral;
  setLocation?: (location: google.maps.LatLngLiteral) => void;
  style?: any;
  openedPin?: any;
  center?: google.maps.LatLngLiteral | null;
  showCarousel?: boolean;
  setShowCarousel: (showCarousel: boolean) => void;
}) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<any>(openedPin);
  const [highlightedPinId, setHighlightedPinId] = useState<number | null>(null);
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [userFirstName, setUserFirstName] = useState<string>("");
  const [userLastName, setUserLastName] = useState<string>("");
  const [pinCreatorName, setPinCreatorName] = useState<string>("");
  const [center, setCenter] = useState<google.maps.LatLngLiteral>(initCenter);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [currentPinId, setCurrentPinId] = useState<number | null>(null);
  const [closestPins, setClosestPins] = useState<any[]>([]);
  const [hoveredPinId, setHoveredPinId] = useState<number | null>(null);
  // const router = useRouter();

  useEffect(() => {
    if (propCenter) {
      setCenter(propCenter);
      if (mapRef.current) {
        mapRef.current.panTo(propCenter);
      }
    }
  }, [propCenter]);

  const fetchPins = async () => {
    // Fetch pins from Supabase (you can uncomment this if you need it)
    // const { data, error } = await supabase.from('pins').select('*');
    // if (error) {
    //   console.error('Error fetching pins:', error);
    // } else {
    //   setPins(data || []);
    // }
  };

  useEffect(() => {
    fetchPins(); // Fetch pins on component mount

    // Get the user's location
    if (navigator.geolocation) {
      console.log("NAVIGATOR")
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          console.log("USER LOCATION", [position.coords.latitude, position.coords.longitude]);
          console.log("SET TO USER LOCATION", userLocation);
          setCenter({
            lat: position.coords.latitude || initCenter.lat,
            lng: position.coords.longitude || initCenter.lng,
          });
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
    console.log("FINAL USER LOCATION", userLocation);
  }, []);

  useEffect(() => {
    const topic = searchParams.get('topic');
    console.log("PINS ARE:", pins);
    const pinParamId = searchParams.get('pin');
    if (pinParamId && pins.length > 0) {
      console.log("FINDING PIN BY ID:", pinParamId);
      console.log("FIRST PIN IS :", pins);
      const urlPin = pins.find((pin) => pin.id === parseInt(pinParamId));
      console.log("PIN IS :", urlPin);
      openPinModal(urlPin);
    }
  }, [pins]);

  useEffect(() => {
    if (pins.length === 0) return;

    //get k closest pins
    let closestPins;
    let k = 5;
    console.log("cow", userLocation);

    // use hardcoded for now while developing
    closestPins = getClosestPins(pins, initCenter.lat, initCenter.lng, k);

    //uncomment to use actual location
    if (!userLocation) {
      closestPins = getClosestPins(pins, initCenter.lat, initCenter.lng, k); 
    } else {
      const { lat, lng } = userLocation;
      closestPins = getClosestPins(pins, lat, lng, k);
    }
    setClosestPins(closestPins);
    setShowCarousel(true);
    console.log("CLOSEST PINS ARE:", closestPins);
  }, [pins.length, userLocation]);


  //for use for the Haversine Distance calculation
  function toRad(degree: number): number {
    return degree * Math.PI / 180;
  }

  //use Haversine distance to calculate distance between two points using their latitudes and longitudes
  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const earthRadius = 6371; // Earth radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c; // Distance in kilometers
  }

  // Get k closest pins using haversineDistance
  function getClosestPins(
    pins: { latitude: number; longitude: number;[key: string]: any }[],
    userLat: number,
    userLng: number,
    k: number
  ) {
    return pins
      .map(pin => ({
        ...pin,
        distance: haversineDistance(userLat, userLng, pin.latitude, pin.longitude)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  }

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      // If we have a propCenter, use it immediately
      if (propCenter) {
        map.panTo(propCenter);
      }

      // Ensure google object is defined before using it
      if (userLocation && google) {
        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "You are here",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#1A73E8",
            fillOpacity: 1,
            strokeWeight: 4,
            strokeColor: "#FFFFFF",
          },
        });
      }
    },
    [userLocation, propCenter]
  );

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: false,
    styles: mapStyles,
    backgroundColor: "#f5f2e9",
    gestureHandling: "greedy",
  };

  const handlePinClick = async (pin: any) => {
    setSelectedPin(pin);
    setHighlightedPinId(pin.id); 
    // Fetch topic name
    const { data: topicData, error: topicError } = await supabase
      .from("topics")
      .select("name")
      .eq("id", pin.topic_id)
      .single();

    if (topicError) {
      console.error(topicError);
    }
    // window.history.pushState(null, '', `/map/${topicData?.name}/${pin.id}`)
    const params = new URLSearchParams(searchParams);
    params.set("topic", pin.topic_id);
    params.set("pin", pin.id);
    replace(`${pathname}?${params.toString()}`);
    console.log(pin);
    openPinModal(pin);
  };

  const openPinModal = async (pin: any) => {
    setSelectedPin(pin);
    console.log("pin details", pin);
    setModalOpen(true);
    setCenter({ lat: pin.latitude, lng: pin.longitude });

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("firstname, lastname")
      .eq("id", pin.user_id)
      .single();

    if (userError) {
      console.error(userError);
    }

    setPinCreatorName(userData?.firstname + " " + userData?.lastname);
    console.log(pinCreatorName)
  }

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPin(null);
    setHighlightedPinId(null); 
    setUserFirstName("");
    setUserLastName("");
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('pin');
    replace(`${pathname}?${nextSearchParams.toString()}`);
  };

  const handleCarouselPinClick = (pin: any) => {
    if (!pin) return;
    setHighlightedPinId(pin.id);
    setCenter({ lat: pin.latitude, lng: pin.longitude });
    if (mapRef.current) {
      mapRef.current.panTo({ lat: pin.latitude, lng: pin.longitude });
    }
    openPinModal(pin);
  };

  const handleCarouselClose = () => {
    setShowCarousel(false);
    setHighlightedPinId(null); // Reset the highlighted pin when carousel is closed
  };

  // Function to get marker icon with red color for highlighted pin
  const getMarkerIcon = (pin: any) => {
    const baseIcon = iconMappings[pin.topic_id as keyof typeof iconMappings];
    if (pin.id === highlightedPinId || pin.id === hoveredPinId) {
      // For highlighted or hovered pin, use the red version of the icon
      return {
        url: baseIcon.highlighted,
        scaledSize: new google.maps.Size(30, 30),
      };
    }
    return {
      url: baseIcon.normal,
      scaledSize: new google.maps.Size(30, 30),
    };
  };

  return (
    <div className="relative h-screen">
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <GoogleMap
          mapContainerStyle={style || containerStyle}
          center={propCenter || center}
          zoom={16}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
          onClick={onMapClick || undefined}
        >
          {pins.map((pin) => (
            <Marker
              key={pin.id}
              position={{ lat: pin.latitude, lng: pin.longitude }}
              onClick={() => handlePinClick(pin)}
              title={pin.name}
              icon={getMarkerIcon(pin)}
            />
          ))}

          {location && (
            <Marker
              position={location}
              title="Selected Location"
            />
          )}

          {mapRef.current && (
            <Marker
              position={
                userLocation === null || userLocation === undefined
                  ? initCenter
                  : userLocation
              }
              title="You are here"
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#1A73E8",
                fillOpacity: 1,
                strokeWeight: 4,
                strokeColor: "#FFFFFF",
              }}
            />
          )}
        </GoogleMap>
        {closestPins.length > 0 && showCarousel && (
          <NearestPinsCarousel 
            pins={closestPins} 
            setClosestPinsCarouselOpen={handleCarouselClose}
            onPinClick={handleCarouselPinClick}
            selectedPinId={highlightedPinId}
            onPinHover={setHoveredPinId}
          />
        )}
      </LoadScript>
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={selectedPin?.name}
        description={selectedPin?.description}
        name={pinCreatorName}
        pin_id={selectedPin?.id}
        event_name={selectedPin?.name}
        event_desc={selectedPin?.description}
        image_url={selectedPin?.image_url || "/placeholder.svg"}
      />

      <CommentsSection
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        pinId={currentPinId}
      />
    </div>
  );
}
