import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setQuery } from "@/slices/querySlice";
import { VideoGrid } from "@/components/VideoGrid";
import { Navbar } from "@/components/Navbar";
import { LeftBar } from "@/components/Leftbar";
import axios from "axios";

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const getFilteredItems = (query: string, posts: any[], userLocation: { latitude: number, longitude: number }, maxDistance: number) => {
  if (!query && !userLocation) {
    return posts;
  }

  return posts.filter((post:any) => {
    const matchesQuery = post.heading.toLowerCase().includes(query.toLowerCase());

    let matchesLocation = true;
    if (userLocation && post.location && post.location.latitude && post.location.longitude) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        post.location.latitude,
        post.location.longitude
      );
      matchesLocation = distance <= maxDistance; // Only include posts within the max distance
    }

    return matchesQuery && matchesLocation;
  });
};

export default function Postings({ initialPosts }: { initialPosts: any[] }) {
  const query = useSelector((state: any) => state.query.query);
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [maxDistance, setMaxDistance] = useState(10);

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            setError("Unable to retrieve your location.");
            console.error("Geolocation error:", error);
          }
        );
      } else {
        setError("Geolocation is not supported by this browser.");
      }
    };

    getLocation();
  }, []);

  if(!userLocation){
    return;
  }
  const filteredPosts = getFilteredItems(query, initialPosts, userLocation , maxDistance);

  const handleLocationRangeChange = (newRange: number) => {
    setMaxDistance(newRange);
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      <Navbar onSearch={(newQuery: string) => dispatch(setQuery(newQuery))} />
      <div className="flex p-4 space-x-4">
        <div className="w-1/7">
          <LeftBar locationRange={maxDistance} setLocationRange={handleLocationRangeChange}/>
        </div>
        <div className="w-4/5">
          {error ? (
            <div className="text-red-600 p-4">{error}</div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-gray-600 p-4">No Post Available</div>
          ) : (
            <VideoGrid videos={filteredPosts} isViewingYourPost={false} />
          )}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  try {
    const response = await axios.get(`${process.env.LINK}/api/posts`, {
      headers: {
        Cookie: context.req.headers.cookie || "",
      },
    });
    const initialPosts = response.data;
    console.log(initialPosts);
    return {
      props: {
        initialPosts,
      },
    };
  } catch (error) {
    console.error("Error fetching posts in getServerSideProps:", error);

    return {
      props: {
        initialPosts: [],
        error: "Failed to load posts",
      },
    };
  }
}
