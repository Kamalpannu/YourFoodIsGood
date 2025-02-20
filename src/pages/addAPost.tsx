import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const AddPost = () => {
  const [heading, setHeading] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error fetching location:', error);
          alert('Unable to fetch location. Proceeding without location.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('heading', heading);
    formData.append('price', price);
    formData.append('file', file);
    formData.append('address', location);

    if (userLocation) {
      formData.append('latitude', userLocation.lat.toString());
      formData.append('longitude', userLocation.lng.toString());
    }

    try {
      const response = await axios.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response) {
        alert('Post created successfully');
        router.push('/postings');
      }
    } catch (error) {
      console.error('Failed to create post', error);
      alert('Error creating post');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white text-black p-10 rounded-3xl shadow-lg w-full max-w-lg"
      >
        <h1 className="text-4xl font-bold mb-8 text-center">
          Add Your Post
        </h1>

        <label className="block text-sm font-semibold mb-4">
          Heading
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            className="mt-2 block w-full border bg-gray-100 p-4 rounded-lg focus:ring-2 focus:ring-gray-700"
            placeholder="Enter post heading"
            required
          />
        </label>

        <label className="block text-sm font-semibold mb-4">
          Image
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-2 block w-full bg-gray-100 p-4 rounded-lg focus:ring-2 focus:ring-gray-700"
            required
          />
        </label>

        <label className="block text-sm font-semibold mb-4">
          Price
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-2 block w-full border bg-gray-100 p-4 rounded-lg focus:ring-2 focus:ring-gray-700"
            placeholder="Enter the price"
            required
          />
        </label>

        <label className="block text-sm font-semibold mb-4">
          Location
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-2 block w-full border bg-gray-100 p-4 rounded-lg focus:ring-2 focus:ring-gray-700"
            placeholder="Enter location (e.g., city or address)"
            required
          />
        </label>

        <button
          type="button"
          onClick={fetchUserLocation}
          className="w-full mt-4 bg-gray-700 text-white py-3 rounded-lg font-bold hover:bg-gray-600 transition duration-300"
        >
          Fetch My Location
        </button>

        <div className="mt-6">
          {userLocation ? (
            <p className="text-sm text-gray-500">
              Location: {location}, Latitude: {userLocation.lat}, Longitude: {userLocation.lng}
            </p>
          ) : (
            <p className="text-sm text-gray-500">Location not fetched yet.</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-900 transition duration-300"
        >
          Submit Post
        </button>
      </form>
    </div>
  );
};

export default AddPost;
