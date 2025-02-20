import { useState, useEffect } from "react";
import { SearchBar } from "./SearchBar";
import { useRouter } from "next/router";
import axios from "axios";

interface NavbarProps {
  onSearch: (query: string) => void;
}

export const Navbar = ({ onSearch }: NavbarProps) => {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    axios
      .get("/api/auth/me", { withCredentials: true })
      .then((response) => {
        if (response) {
          setUsername(response.data.username);
          setIsSignedIn(true);
        }
      })
      .catch(() => {
        setIsSignedIn(false);
      });
  }, []);

  const handleSignOut = async () => {
    await axios.post("/api/auth/signout", {}, { withCredentials: true });
    setIsSignedIn(false);
    setUsername(null);
    router.replace("/");
  };

  const navigateToSignIn = () => router.push("/Signin");
  const navigateToSignUp = () => router.push("/SignUp");

  return (
    <div className="relative sticky z-50 top-0 flex flex-col sm:flex-row justify-between items-center p-4 bg-black text-white shadow-lg overflow-visible">
      {/* Logo */}
      <div
        className="text-2xl font-extrabold cursor-pointer hover:opacity-90 w-auto"
        onClick={() => router.push("/")}
      >
        YourFoodIsGood
      </div>

      {/* Search Bar */}
      {isSignedIn && (
        <div className="w-full sm:w-auto sm:flex-1 sm:flex justify-center mt-4 sm:mt-0">
          <SearchBar onSearch={onSearch} />
        </div>
      )}

      {/* User Controls */}
      <div className="flex space-x-4 items-center mt-4 sm:mt-0">
        {isSignedIn ? (
          <>
            {/* Username */}
            <span className="text-sm md:text-base font-medium bg-gray-700 px-3 py-1 rounded-full">
              {username}
            </span>

            {/* Sign Out Button */}
            <button
              className="px-4 py-2 rounded-lg text-sm md:text-base bg-red-500 hover:bg-red-600 transition duration-300"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </>
        ) : (
          router.pathname === "/" && ( // Show Sign In/Sign Up only on Home Page
            <>
              {/* Sign In Button */}
              <button
                className="px-4 py-2 rounded-lg text-sm md:text-base bg-gray-700 hover:bg-gray-600 transition duration-300"
                onClick={navigateToSignIn}
              >
                Sign In
              </button>

              {/* Sign Up Button */}
              <button
                className="px-4 py-2 rounded-lg text-sm md:text-base bg-blue-600 hover:bg-blue-700 transition duration-300"
                onClick={navigateToSignUp}
              >
                Sign Up
              </button>
            </>
          )
        )}
      </div>
    </div>
  );
};
