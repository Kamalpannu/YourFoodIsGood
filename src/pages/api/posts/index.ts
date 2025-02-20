// Other imports remain unchanged
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/db';
import authenticate, { UpdateRequest } from '../auth/authenticate';
import formidable, { IncomingForm, Fields, Files } from 'formidable';
import cloudinary from 'cloudinary';
import { OpenAI } from 'openai';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadImageToCloudinary = async (filePath: string): Promise<string> => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder: 'uploads',
      width: 300,
      height: 200,
      crop: "fill",
    });
    return result.secure_url;
  } catch (error) {
    throw new Error('Error uploading image to Cloudinary');
  }
};

export default async function handler(req: UpdateRequest, res: NextApiResponse) {
  authenticate(req, res, async () => {
    const userId = req.userId;

    if (req.method === 'GET') {
      try {
        if (!userId) {
          return res.status(401).json({ message: 'User not authenticated' });
        }

        const posts = await prisma.post.findMany({
          include: {
            user: { select: { username: true } },
            location: true,
          },
        });

        const formattedPosts = posts.map((post) => ({
          id: post.id,
          heading: post.heading,
          imagelink: post.imagelink,
          price: post.price, // Changed from reviews to price
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

        return res.status(200).json(formattedPosts);
      } catch (error) {
        return res.status(500).json({ message: 'Error retrieving posts' });
      }
    }

    if (req.method === 'POST') {
      const form = new IncomingForm();
      form.parse(req, async (err: any, fields: Fields, files: Files) => {
        if (err) {
          return res.status(500).json({ message: 'Error parsing form data' });
        }

        const heading = Array.isArray(fields.heading) ? fields.heading[0] : fields.heading;
        const price = Array.isArray(fields.price) ? parseFloat(fields.price[0]) : parseFloat(fields.price || '0');
        const address = Array.isArray(fields.address) ? fields.address[0] : fields.address;
        const latitude = Array.isArray(fields.latitude) ? parseFloat(fields.latitude[0]) : parseFloat(fields.latitude || '0');
        const longitude = Array.isArray(fields.longitude) ? parseFloat(fields.longitude[0]) : parseFloat(fields.longitude || '0');

        if (typeof heading !== 'string' || isNaN(price)) { // Validate price as a number
          return res.status(400).json({ message: 'Invalid input data' });
        }

        const file = files.file instanceof Array ? files.file[0] : files.file;
        let imageUrl = '';
        if (file?.filepath) {
          try {
            imageUrl = await uploadImageToCloudinary(file.filepath);
          } catch {
            return res.status(500).json({ message: 'Error uploading image to Cloudinary' });
          }
        }

        try {
          if (!userId || typeof userId !== 'number') {
            return res.status(401).json({ message: 'User not authenticated' });
          }

          let location = null;
          if (address || !isNaN(latitude) || !isNaN(longitude)) {
            location = await prisma.location.create({
              data: {
                address: address || null,
                latitude: !isNaN(latitude) ? latitude : undefined,
                longitude: !isNaN(longitude) ? longitude : undefined,
              },
            });
          }

          const newPost = await prisma.post.create({
            data: {
              heading,
              imagelink: imageUrl,
              price,
              locationId: location?.id || null,
              userId,
            },
            include: {
              user: { select: { username: true } },
              location: true,
            },
          });

          const response = {
            id: newPost.id,
            heading: newPost.heading,
            imagelink: newPost.imagelink,
            price: newPost.price,
            description: newPost.description,
            location: newPost.location
              ? {
                  address: newPost.location.address,
                  latitude: newPost.location.latitude,
                  longitude: newPost.location.longitude,
                }
              : null,
            createdAt: newPost.createdAt,
            createdBy: newPost.user.username,
          };

          return res.status(201).json(response);
        } catch {
          return res.status(500).json({ message: 'Error saving post to database' });
        }
      });
      return;
    }

    return res.status(405).json({ message: 'Method not allowed' });
  });
}
