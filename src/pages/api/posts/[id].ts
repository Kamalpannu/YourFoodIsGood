// pages/api/posts/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import  prisma  from '../../../../lib/db'; // Path to your Prisma client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      select: {
        soldOut: true,
      },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json(post); // Send back the soldOut state
  } catch (error) {
    console.error('Error fetching post:', error);
    return res.status(500).json({ message: 'Error fetching post' });
  }
}
