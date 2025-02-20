import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { useRouter } from 'next/router';
import { format } from 'date-fns';

interface Comment {
  id: number;
  content: string;
  userId: number;
  username: string;
  createdAt: string;
}

export async function getServerSideProps(context: any) {
  const { postId } = context.query;

  let initialComments: Comment[] = [];

  if (postId) {
    try {
      const response = await axios.get(
        `${process.env.LINK}/api/comments?postId=${postId}`,
        {
          withCredentials: true,
          headers: {
            Cookie: context.req.headers.cookie || '',
          },
        }
      );
      initialComments = response.data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }

  return { props: { initialComments } };
}

export default function Comments({ initialComments }: { initialComments: Comment[] }) {
  const router = useRouter();
  const { postId, videoHeading, createdBy, soldout } = router.query;

  // Convert soldout query to boolean
  const isSoldOut = soldout === 'true';  // Convert string 'true' to boolean

  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const pusherRef = useRef<Pusher | null>(null);

  console.log(soldout);

  useEffect(() => {
    if (!postId) return;

    if (!pusherRef.current) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      });
    }

    const channel = pusherRef.current.subscribe(`post-${postId}`);

    const handleNewComment = (data: Comment) => {
      console.log('New comment received:', data);
      setComments((prevComments) => {
        if (prevComments.some((comment) => comment.id === data.id)) {
          console.log('Duplicate comment detected:', data);
          return prevComments;
        }
        return [...prevComments, data];
      });
    };

    channel.bind('new-comment', handleNewComment);

    return () => {
      channel.unbind('new-comment', handleNewComment);
      channel.unsubscribe();
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, [postId]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !postId || loading) return;

    setLoading(true);

    try {
      const response = await axios.post(
        '/api/comments',
        { content: newComment, postId },
        { withCredentials: true }
      );

      setComments((prevComments) => {
        if (prevComments.some((comment) => comment.id === response.data.id)) {
          console.log('Duplicate comment detected from backend');
          return prevComments;
        }
        console.log('Adding new comment:', response.data);
        return [...prevComments, response.data];
      });

      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-white via-gray-100 to-gray-200 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">{videoHeading}</h1>

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-lg text-gray-600 text-center">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => {
            const isAdminComment =
              comment.username?.toLowerCase() === createdBy?.toString().toLowerCase();

            // Correctly formatting the date inside the map function
            const formattedDate = new Date(comment.createdAt).toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            });

            return (
              <div
                key={comment.id}
                className={`p-4 border rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl ${isAdminComment ? 'bg-green-400' : 'bg-white'}`}
              >
                <div className="flex items-center space-x-3">
                  <strong className="text-lg font-semibold text-gray-800">
                    {comment.username || 'Unknown User'}
                  </strong>
                  <span className="text-sm text-gray-500">
                    {formattedDate || 'Date unknown'}
                  </span>
                </div>
                <p className="mt-2 text-gray-700">{comment.content || 'No content available'}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Conditionally render the comment section if the item is not sold out */}
      {isSoldOut ? (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-xl">
          <p className="text-lg text-gray-600 text-center">This item is sold out, and comments are disabled.</p>
        </div>
      ) : (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-xl">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={4}
            className="w-full p-3 border-2 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ease-in-out"
          />
          <button
            onClick={handleSendComment}
            disabled={loading}
            className="mt-4 w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-400 transition-all ease-in-out"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      )}
    </div>
  );
}
