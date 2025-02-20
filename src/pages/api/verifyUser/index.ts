import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/db';
import authenticate, { UpdateRequest } from '../auth/authenticate';

export default async function handler(req: UpdateRequest, res: NextApiResponse) {
  authenticate(req, res, async () => {
    const userId = req.userId;
    console.log('Authenticated userId:', userId);

    if (req.method === 'GET') {
      try {
        if (!userId) {
          console.warn('User not authenticated for GET');
          return res.status(401).json({ message: 'User not authenticated' });
        }
        if (typeof userId !== "number") {
          console.warn('Invalid userId type:', typeof userId);
          return res.status(500).json({ message: 'Server error' });
        }

        console.log('Fetching user posts from database...');
        const posts = await prisma.post.findMany({
          where: { userId: userId },
          include: {
            user: { select: { username: true } },
            location: true,
          },
        });

        const formattedPosts = posts.map((post) => ({
          id: post.id,
          heading: post.heading,
          imagelink: post.imagelink,
          price: post.price,
          location: post.location
            ? {
                address: post.location.address,
                latitude: post.location.latitude,
                longitude: post.location.longitude,
              }
            : null,
          createdAt: post.createdAt,
          createdBy: post.user.username,
        }));

        console.log('User posts fetched successfully');
        return res.status(200).json(formattedPosts);
      } catch (error) {
        console.error('Error retrieving posts:', error);
        return res.status(500).json({ message: 'Error retrieving posts' });
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      console.log('DELETE request received, id:', id);

      if (!id || typeof id !== 'string') {
        console.warn('Invalid or missing post ID:', id);
        return res.status(400).json({ message: 'Invalid or missing post ID' });
      }

      try {
        console.log('Checking post ownership...');
        const post = await prisma.post.findUnique({
          where: { id: parseInt(id) },
          select: { userId: true },
        });

        if (!post) {
          console.warn('Post not found for id:', id);
          return res.status(404).json({ message: 'Post not found' });
        }
        if (typeof post.userId !== "number") {
          console.warn('Invalid userId in post:', post.userId);
          return res.status(500).json({ message: 'Server error' });
        }
        if (typeof userId !== "number") {
          console.warn('Invalid userId in request:', userId);
          return res.status(500).json({ message: 'Server error' });
        }

        if (post.userId !== userId) {
          console.warn('Unauthorized delete attempt for postId:', id);
          return res.status(403).json({ message: 'You are not authorized to delete this post' });
        }

        console.log('Deleting post with id:', id);
        await prisma.post.delete({
          where: { id: parseInt(id) },
        });

        console.log('Post deleted successfully');
        return res.status(200).json({ message: 'Post deleted successfully' });
      } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ message: 'Error deleting post' });
      }
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      console.log('PUT request received, id:', id);

      if (!id || typeof id !== 'string') {
        console.warn('Invalid or missing post ID:', id);
        return res.status(400).json({ message: 'Invalid or missing post ID' });
      }

      try {
        const { heading, price, soldOut } = req.body;
        console.log('Received body data:', { heading, price, soldOut });

        if (typeof heading !== 'string' ||(typeof price !== 'string' && typeof price !== 'number') ) {
          console.warn('Invalid input data:', { heading, price });
          return res.status(400).json({ message: 'Invalid input data' });
        }

        const isSoldOut = soldOut === true || soldOut === 'true';
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        console.log('Parsed numeric price:', numericPrice, 'isSoldOut:', isSoldOut);

        console.log('Checking post ownership...');
        const post = await prisma.post.findUnique({
          where: { id: parseInt(id) },
          select: { userId: true },
        });

        if (!post) {
          console.warn('Post not found for id:', id);
          return res.status(404).json({ message: 'Post not found' });
        }
        if (typeof post.userId !== "number") {
          console.warn('Invalid userId in post:', post.userId);
          return res.status(500).json({ message: 'Server error' });
        }
        if (typeof userId !== "number") {
          console.warn('Invalid userId in request:', userId);
          return res.status(500).json({ message: 'Server error' });
        }

        if (post.userId !== userId) {
          console.warn('Unauthorized update attempt for postId:', id);
          return res.status(403).json({ message: 'You are not authorized to update this post' });
        }

        console.log('Updating post with id:', id);
        const updatedPost = await prisma.post.update({
          where: { id: parseInt(id) },
          data: {
            heading,
            price: numericPrice,
            soldOut: isSoldOut,
          },
        });

        console.log('Post updated successfully');
        return res.status(200).json(updatedPost);
      } catch (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ message: 'Error updating post' });
      }
    }

    console.warn('Unsupported HTTP method');
    return res.status(405).json({ message: 'Method not allowed' });
  });
}
