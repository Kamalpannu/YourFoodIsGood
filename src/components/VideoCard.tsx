import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export interface Video {
  id: number;
  imagelink: string;
  heading: string;
  price: number | null;
  createdBy: string;
  createdAt: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  } | null;
  isViewingYourPost: boolean;
  soldOut: boolean;
}

export function VideoCard(props: Video) {
  const router = useRouter();
  const [isView, setIsView] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [updatedHeading, setUpdatedHeading] = useState<string>(props.heading);
  const [updatedPrice, setUpdatedPrice] = useState<number|null>(props.price);
  const [soldOut, setSoldOut] = useState<boolean>(props.soldOut);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch the soldOut state from the backend
  useEffect(() => {
    const fetchSoldOutState = async () => {
      try {
        const response = await fetch(`/api/posts/${props.id}`); // Adjust your endpoint as needed
        const data = await response.json();
        if (data && data.soldOut !== undefined) {
          setSoldOut(data.soldOut);
        }
      } catch (error) {
        console.error('Error fetching soldOut state:', error);
      }
    };

    fetchSoldOutState();
  }, [props.id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);

    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  const handleCardClick = () => {
    const { latitude = 0, longitude = 0 } = props.location || {};
    router.push({
      pathname: '/video-details',
      query: {
        id: props.id,
        imagelink: props.imagelink,
        heading: props.heading,
        price: props.price !== null ? props.price : 'Not Provided',
        location: props.location?.address || 'Not available',
        lat: latitude,
        lng: longitude,
      },
    });
  };

  const handleDeleteButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleUpdateButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowUpdateModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/verifyUser?id=${props.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.ok) {
        alert('Post deleted successfully');
        setShowDeleteModal(false);
        router.push('/yourPostings');
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const confirmUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/verifyUser?id=${props.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heading: updatedHeading, price: updatedPrice, soldOut }),
        credentials: 'include',
      });

      if (res.ok) {
        alert('Post updated successfully');
        setShowUpdateModal(false);
        router.push('/yourPostings');
      } else {
        alert('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const timeDifference = (createdAt: string): string => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const differenceInMs = now.getTime() - createdDate.getTime();

    const minutes = Math.floor(differenceInMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);

    if (months > 0) return `${months} ${months === 1 ? 'month' : 'months'}`;
    if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'}`;
    if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    return 'Just now';
  };

  return (
    <motion.div
      className="relative p-4 border border-gray-300 rounded-lg shadow-md cursor-pointer bg-white transition-transform transform hover:scale-105"
      style={{ height: 'fit-content', maxHeight: '400px', maxWidth: '320px' }}
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      onClick={handleCardClick}
    >
      <img className="rounded-md w-full h-40 object-cover" src={props.imagelink} alt={props.heading} />
      <div className="font-semibold text-lg text-gray-700 mt-3 truncate">
        {props.heading}
        {soldOut && <span className="text-red-500 ml-2 font-medium">(Sold Out)</span>}
      </div>
      <div className="text-sm text-gray-500 mt-1">Price: ${props.price ?? 'Not Provided'}</div>
      <div className="mt-4 text-sm text-gray-700">
        <strong>Location:</strong> {props.location?.address || 'Not provided'}
      </div>
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500 space-x-3">
        <span className="font-medium text-gray-700 truncate">Author: {props.createdBy}</span>
        <span className="text-gray-400">Time: {timeDifference(props.createdAt)}</span>
      </div>
      <div className="mt-auto">
        {props.isViewingYourPost ? (
          <>
            <button
              className="w-full py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 mb-2"
              onClick={handleDeleteButtonClick}
            >
              Delete
            </button>
            <button
              className="w-full py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 mb-2"
              onClick={handleUpdateButtonClick}
            >
              Edit
            </button>
          </>
        ) : (
          <button
            className="w-full py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600"
            onClick={(event) => {
              event.stopPropagation();
              router.push({
                pathname: '/comments',
                query: { postId: props.id, videoHeading: props.heading, createdBy: props.createdBy, soldout: soldOut },
              });
            }}
          >
            View Comments
          </button>
        )}
      </div>

      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Are you sure you want to delete this post?</h2>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={confirmDelete}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10"
          onClick={() => setShowUpdateModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Update Post</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={updatedHeading}
                onChange={(e) => setUpdatedHeading(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Updated Heading"
              />
              <input
                type="number"
                value={updatedPrice !== null ? updatedPrice : ''}
                onChange={(e) => setUpdatedPrice(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Updated Price"
              />
              <div className="flex items-center space-x-2">
                <label>
                  <input
                    type="checkbox"
                    checked={soldOut}
                    onChange={() => setSoldOut(!soldOut)}
                    className="mr-2"
                  />
                  Sold Out
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                onClick={() => setShowUpdateModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={confirmUpdate}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
