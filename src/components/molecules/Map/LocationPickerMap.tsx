// components/LocationPickerMap.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useLoadScript,
} from "@react-google-maps/api";
import { Input } from "@/components/atoms/Forms/Input";

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "8px",
  marginTop: "10px",
};

const libraries = ["places"] as const;

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

export function LocationPickerMap({
  lat,
  lng,
  onChange,
  readOnly = false,
}: LocationPickerMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || "",
    libraries: readOnly ? [] : [...libraries],
  });
  const [searchValue, setSearchValue] = useState("");
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: !readOnly,
      draggable: !readOnly,
      scrollwheel: !readOnly,
      disableDoubleClickZoom: readOnly,
      styles: isDark
        ? (darkMapStyles as google.maps.MapTypeStyle[])
        : undefined,
    }),
    [isDark, readOnly]
  );

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (readOnly || !onChange) return;
      if (e.latLng) {
        onChange(e.latLng.lat(), e.latLng.lng());
      }
    },
    [onChange, readOnly]
  );

  const handlePlaceChanged = useCallback(() => {
    if (readOnly || !onChange) return;

    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      const newLat = place.geometry.location.lat();
      const newLng = place.geometry.location.lng();
      onChange(newLat, newLng);
      setSearchValue(place.formatted_address || "");
    }
  }, [onChange, readOnly]);

  if (!apiKey) {
    return (
      <div className="p-4 mt-2 text-center border rounded bg-yellow-50 border-yellow-300 flex flex-col items-center gap-2">
        <svg
          className="w-8 h-8 text-yellow-400 mb-1"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01"
          />
        </svg>
        <span className="text-gray-700 font-semibold">
          Google Maps API key tidak ditemukan
        </span>
        <span className="text-gray-600 text-sm">
          Silakan set{" "}
          <code className="bg-gray-100 px-1 rounded">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          di file <code className="bg-gray-100 px-1 rounded">.env</code>.
        </span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 text-center text-red-500">
        Gagal memuat Google Maps.
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="p-4 text-center">Memuat peta…</div>;
  }

  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={{ lat, lng }}
        zoom={13}
        options={mapOptions}
        onClick={handleMapClick}
      >
        {!readOnly && (
          <div
            className="bg-white dark:bg-gray-800 p-2 rounded shadow-md"
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              width: "90%",
              maxWidth: 400,
            }}
          >
            <Autocomplete
              onLoad={(ac) => {
                autocompleteRef.current = ac;
              }}
              onPlaceChanged={handlePlaceChanged}
            >
              <Input
                type="text"
                placeholder="Cari lokasi…"
                className="w-full mb-2"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </Autocomplete>
          </div>
        )}
        <Marker position={{ lat, lng }} />
      </GoogleMap>
    </div>
  );
}
