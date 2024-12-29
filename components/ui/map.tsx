import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { createClient } from "@supabase/supabase-js";
import Modal from "./modal"; // Import your Modal component
import { useRouter } from "next/router";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const iconMappings = {
  1: "/assets/bathroom.svg",
  2: "/assets/wheelchair.svg",
  3: "/assets/police.svg",
  5: "/assets/food.svg",
  6: "/assets/gym.svg",
  8: "/assets/world.svg",
  9: "/assets/wifi.svg",
  10: "/assets/water.svg",
  11: "/assets/farmers-market.svg",
  12: "/assets/book.svg",
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

export default function Map({
  pins,
  onMapClick,
  location,
  style,
}: {
  pins: any[];
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
  location?: google.maps.LatLngLiteral;
  setLocation?: (location: google.maps.LatLngLiteral) => void;
  style?: any;
}) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [userFirstName, setUserFirstName] = useState<string>("");
  const [userLastName, setUserLastName] = useState<string>("");

  const [center, setCenter] = useState<google.maps.LatLngLiteral>(initCenter);
  const [selectedPinLikes, setSelectedPinLikes] = useState<number>(0);

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
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
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
  }, []);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

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
    [userLocation]
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

  const handleMarkerClick = async (pin: any) => {
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

    // Fetch like count for the pin
    // const { count: likeCount, error: likeError } = await supabase
    //   .from("likes")
    //   .select("pin_id", { count: "exact" }) // 'exact' gives the actual count
    //   .eq("pin_id", pin.id)
    //   .eq("vote_type", 1);

    // if (likeError) {
    //   console.error(likeError);
    // }

    // // Fetch dislike count for the pin
    // const { count: dislikeCount, error: dislikeError } = await supabase
    //   .from("likes")
    //   .select("pin_id", { count: "exact" }) // 'exact' gives the actual count
    //   .eq("pin_id", pin.id)
    //   .eq("vote_type", -1);

    // if (likeError) {
    //   console.error(likeError);
    // }

    // Combine the results in one object
    const result = {
      firstname: userData?.firstname,
      lastname: userData?.lastname,
    };
    setUserFirstName(result.firstname);
    setUserLastName(result.lastname);
    // setSelectedPinLikes(result.total_likes ?? 0);
    console.log(result); // Check the final result
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPin(null);
    setUserFirstName("");
    setUserLastName("");
  };
  return (
    <div className={!onMapClick ? "h-screen" : ""}>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      >
        <GoogleMap
          mapContainerStyle={style || containerStyle}
          center={center}
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
              onClick={() => handleMarkerClick(pin)}
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
        title={selectedPin?.name || ""}
        description={selectedPin?.description || ""}
        firstname={userFirstName}
        lastname={userLastName}
        pin_id={selectedPin?.id}
        event_name={selectedPin?.name}
        event_desc={selectedPin?.description}
      />
    </div>
  );
}
