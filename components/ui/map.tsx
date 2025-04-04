import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { createClient } from "@supabase/supabase-js";
import Modal from "./modal"; // Import your Modal component
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import CommentsSection from "@/components/comments-section";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const iconMappings = {
  1: "/assets/topics/bathroom.svg",
  2: "/assets/topics/wheelchair.svg",
  3: "/assets/topics/police.svg",
  5: "/assets/topics/food.svg",
  27: "/assets/topics/gym.svg",
  8: "/assets/topics/world.svg",
  9: "/assets/topics/wifi.svg",
  10: "/assets/topics/water.svg",
  11: "/assets/topics/farmers-market.svg",
  12: "/assets/topics/book.svg",
  18: "/assets/topics/pawprintLogo.svg",
  23: "/assets/topics/flex.png",
  24: "/assets/topics/vendingMachine.svg",
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
}: {
  pins: any[];
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
  location?: google.maps.LatLngLiteral;
  setLocation?: (location: google.maps.LatLngLiteral) => void;
  style?: any;
  openedPin?: any;
  center?: google.maps.LatLngLiteral | null;
}) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<any>(openedPin);
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
    if(pinParamId && pins.length > 0){
      console.log("FINDING PIN BY ID:", pinParamId);
      console.log("FIRST PIN IS :", pins);
      const urlPin = pins.find((pin) => pin.id === parseInt(pinParamId));
      console.log("PIN IS :", urlPin);
      openPinModal(urlPin);
    }
  }, [pins]);
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
    setUserFirstName("");
    setUserLastName("");
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('pin');
    replace(`${pathname}?${nextSearchParams.toString()}`);
  };
  return (
    <div className={!onMapClick ? "h-screen" : ""}>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      >
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
              icon={{
                url: iconMappings[pin.topic_id as keyof typeof iconMappings],
                scaledSize: new google.maps.Size(30, 30),
              }}
            />
          ))}
          {location && <Marker position={location} title="Selected Location" />}

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
      />

      <CommentsSection
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        pinId={currentPinId}
      />
    </div>
  );
}
