import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { motion } from 'framer-motion';

interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

interface VideoDetails {
  id: number;
  imagelink: string;
  heading: string;
  price: string;
  location: Location;
  lat: number;
  lng: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '8px',
  overflow: 'hidden',
};

const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || '';

export default function VideoDetails() {
  const router = useRouter();
  const { id, imagelink, heading, price, location, lat, lng } = router.query;

  const [video, setVideo] = useState<VideoDetails | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: mapKey,
  });

  useEffect(() => {
    if (
      id &&
      imagelink &&
      heading &&
      price &&
      location &&
      lat !== undefined &&
      lng !== undefined
    ) {
      const parsedLat = parseFloat(lat as string);
      const parsedLng = parseFloat(lng as string);

      if (typeof location === 'string') {
        const locationObj: Location = {
          address: location,
          latitude: parsedLat,
          longitude: parsedLng,
        };

        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          setVideo({
            id: parseInt(id as string, 10),
            imagelink: imagelink as string,
            heading: heading as string,
            price: price as string,
            location: locationObj,
            lat: parsedLat,
            lng: parsedLng,
          });
        }
      }
    }
  }, [id, imagelink, heading, price, location, lat, lng]);

  const handleMapClick = () => {
    const googleMapsURL = `https://www.google.com/maps?q=${video?.lat},${video?.lng}`;
    window.open(googleMapsURL, '_blank');
  };

  if (!video) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading video details...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">Failed to load Google Maps</p>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button
        className="px-4 py-2 mb-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        onClick={() => router.back()}
      >
        Go Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow-md">
        <div>
          <img
            className="rounded-md w-full h-72 object-cover"
            src={video.imagelink}
            alt={video.heading}
          />
          <h1 className="text-3xl font-semibold text-gray-800 mt-4">
            {video.heading}
          </h1>
          <p className="text-gray-600 mt-2">Price: {video.price}</p>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Location:</h2>
            <p className="text-gray-700">
              <strong>Address:</strong> {video.location.address} <br />
              <strong>Latitude:</strong> {video.location.latitude} <br />
              <strong>Longitude:</strong> {video.location.longitude}
            </p>
          </div>
        </div>

        <div className="h-72 md:h-full relative">
          {isLoaded ? (
            <div
              className="cursor-pointer w-full h-full rounded-md shadow-lg hover:scale-105 transition-transform duration-300"
              onClick={handleMapClick}
            >
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={{ lat: video.lat, lng: video.lng }}
                zoom={12}
              />
            </div>
          ) : (
            <p className="text-gray-500 text-center">Loading Map...</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
