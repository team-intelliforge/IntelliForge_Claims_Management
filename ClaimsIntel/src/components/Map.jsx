import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";

const libraries = ["places", "routes"];

const DEFAULT_API_URL = process.env.REACT_APP_ROUTE_API_URL || "/api/locations";

const DUMMY_LOCATIONS = [
  { id: 1, name: "Location A", lat: 12.9716, lng: 77.5946 },
  { id: 2, name: "Location B", lat: 12.9352, lng: 77.6245 },
  { id: 3, name: "Location C", lat: 12.9081, lng: 77.6476 },
];

const isValidLocation = (location) => {
  if (!location || typeof location !== "object") {
    return false;
  }

  return Number.isFinite(location.lat) && Number.isFinite(location.lng);
};

const normalizeLocations = (payload) => {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.locations)
      ? payload.locations
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  return items.filter(isValidLocation).map((location) => ({
    id: location.id ?? `${location.lat}-${location.lng}`,
    name:
      location.name ||
      `Location ${location.id ?? ""}`.trim() ||
      "Unnamed location",
    lat: Number(location.lat),
    lng: Number(location.lng),
  }));
};

const buildWaypoints = (locations = []) => {
  if (!Array.isArray(locations) || locations.length < 3) {
    return [];
  }

  return locations.slice(1, -1).map((location) => ({
    location: { lat: location.lat, lng: location.lng },
    stopover: true,
  }));
};

const calculateRoute = async (locations = []) => {
  if (!Array.isArray(locations) || locations.length < 2) {
    return null;
  }

  if (!window.google?.maps?.DirectionsService) {
    return null;
  }

  const origin = locations[0];
  const destination = locations[locations.length - 1];

  const directionsService = new window.google.maps.DirectionsService();

  const result = await directionsService.route({
    origin: { lat: origin.lat, lng: origin.lng },
    destination: { lat: destination.lat, lng: destination.lng },
    waypoints: buildWaypoints(locations),
    travelMode: window.google.maps.TravelMode.DRIVING,
  });

  return result;
};

const fitBounds = (map, locations = []) => {
  if (!map || !Array.isArray(locations) || locations.length === 0) {
    return;
  }

  const bounds = new window.google.maps.LatLngBounds();
  locations.forEach(({ lat, lng }) => {
    bounds.extend({ lat, lng });
  });

  map.fitBounds(bounds);
};

const MapRouteView = ({location_list}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_MAP_API_KEY,
    libraries,
  });

  const [locations, setLocations] = useState(location_list);
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const routeSummary = useMemo(() => {
    if (!directionsResponse || !directionsResponse.routes?.length) {
      return null;
    }

    const route = directionsResponse.routes[0];
    const leg = route.legs?.[0];

    return {
      distance: leg?.distance?.text || "",
      duration: leg?.duration?.text || "",
    };
  }, [directionsResponse]);

  useEffect(() => {
    let isCancelled = false;

    const fetchLocations = async () => {
      if (!isLoaded) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(DEFAULT_API_URL);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const normalized = normalizeLocations(payload);

        if (isCancelled) {
          return;
        }

        if (!normalized.length) {
          setLocations(locations);
          setDirectionsResponse(null);
          setDistance("");
          setDuration("");
          setError(
            "Backend returned no valid locations. Showing fallback demo route.",
          );
          return;
        }

        setLocations(normalized);
      } catch (fetchError) {
        if (!isCancelled) {
          // setError(
          //   fetchError.message ||
          //     "Failed to load route locations. Showing fallback demo route.",
          // );
          setLocations(locations);
          setDirectionsResponse(null);
          setDistance("");
          setDuration("");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchLocations();

    return () => {
      isCancelled = true;
    };
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || !map || locations.length < 2) {
      return;
    }

    let isActive = true;

    const runRouteCalculation = async () => {
      try {
        const result = await calculateRoute(locations);

        if (!isActive || !result?.routes?.length) {
          return;
        }

        const route = result.routes[0];
        const leg = route.legs?.[0];

        setDirectionsResponse(result);
        setDistance(leg?.distance?.text || "");
        setDuration(leg?.duration?.text || "");
        fitBounds(map, locations);
      } catch (routeError) {
        if (isActive) {
          setError(routeError.message || "Route calculation failed.");
          setDirectionsResponse(null);
          setDistance("");
          setDuration("");
        }
      }
    };

    runRouteCalculation();

    return () => {
      isActive = false;
    };
  }, [isLoaded, map, locations]);

  const centerMap = () => {
    if (!map || !locations.length) {
      return;
    }

    if (locations.length === 1) {
      map.panTo({ lat: locations[0].lat, lng: locations[0].lng });
      map.setZoom(15);
      return;
    }

    fitBounds(map, locations);
  };

  if (!isLoaded) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="text" width="100%" height={32} />
        <Skeleton variant="text" width="90%" height={32} />
        <Skeleton variant="text" width="95%" height={32} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "76vw",
        height: "72vh",
      }}
    >
      <Box sx={{ position: "absolute", inset: 0 }}>
        <GoogleMap
          center={
            locations[0]
              ? { lat: locations[0].lat, lng: locations[0].lng }
              : center
          }
          zoom={12}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={(loadedMap) => setMap(loadedMap)}
        >
          {locations.map((location, index) => (
            <Marker
              key={location.id ?? `${location.lat}-${location.lng}`}
              position={{ lat: location.lat, lng: location.lng }}
              label={{
                text: String.fromCharCode(65 + index),
                color: "#fff",
                fontWeight: "700",
              }}
              title={location.name}
            />
          ))}

          {directionsResponse && (
            <Polyline
              path={directionsResponse.routes[0]?.overview_path || []}
              options={{
                strokeColor: "#1976d2",
                strokeOpacity: 0.9,
                strokeWeight: 5,
              }}
            />
          )}
        </GoogleMap>
      </Box>

      
    </Box>
  );
};

const center = { lat: 12.971599, lng: 77.5946 };

export default MapRouteView;
