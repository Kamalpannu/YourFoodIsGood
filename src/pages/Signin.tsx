import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";

const SignIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`/api/auth/signin`, { username, password }, { withCredentials: true });
      console.log("Sign-in successful");
      router.push('/postings');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign in');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-6">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-xl ring-2 ring-black">
        <h2 className="text-3xl font-bold text-center text-black mb-4">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-semibold text-gray-800">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 text-lg text-gray-800 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-lg text-gray-800 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            type="submit"
            className="w-full py-3 text-white bg-black rounded-lg shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
          >
            Sign In
          </Button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Don’t have an account?{' '}
          <Link href="/SignUp" className="text-black hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
