import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setQuery } from "@/slices/querySlice";
import { VideoGrid } from "@/components/VideoGrid";
import { Navbar } from "@/components/Navbar";
import { LeftBar } from "@/components/Leftbar";
import axios from "axios";

const getFilteredItems = (query: string, posts: any[]) => {
  if (!query) {
    return posts;
  }
  return posts.filter((post) =>
    post.heading.toLowerCase().includes(query.toLowerCase())
  );
};

export default function YourPostings({ initialPosts }: { initialPosts: any[] }) {
  const query = useSelector((state: any) => state.query.query);
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);

  const filteredPosts = getFilteredItems(query, initialPosts);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
    <Navbar onSearch={(newQuery: string) => dispatch(setQuery(newQuery))} />
    <div className="flex p-4 space-x-4"> {/* Adjusted space between LeftBar and VideoGrid */}
      <div className="w-1/7">
        <LeftBar locationRange={0} setLocationRange={function (newRange: number): void {
            throw new Error("Function not implemented.");
          } } />
      </div>
      <div className="w-4/5"> {/* Adjusted width for VideoGrid */}
        {error ? (
          <div className="text-red-600 p-4">{error}</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-gray-600 p-4">No Post Available</div>
        ) : (
          <VideoGrid videos={filteredPosts} isViewingYourPost={true} />
        )}
      </div>
    </div>
  </div>
  );
}

export async function getServerSideProps(context: any) {
  try {
    // API call to fetch posts for authenticated user
    const response = await axios.get(`${process.env.LINK}/api/verifyUser`, {
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
