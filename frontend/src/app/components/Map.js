"use client";

import { useEffect } from "react";

const apiKey = process.env.NEXT_GOOGLE_MAPS_API_KEY;

const Map = () => {
  useEffect(() => {
    const initMap = () => {
      new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 28.6139, lng: 77.209 },
        zoom: 10,
      });
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  return <div id="map" className="w-full h-96"></div>;
};

export default Map;
