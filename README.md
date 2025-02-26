# YourFoodIsGood

## 🚀 Overview
YourFoodIsGood is a **Next.js** web application that allows users to post images of food, comment on them, and make purchases. The app utilizes **Cloudinary** for image storage and **Pusher** for real-time interactions.

---

## 🛠️ Features
- 📸 **Post & View Images** (Users can upload food images)
- 💬 **Commenting System** (Engage with other users via comments)
- 🛒 **Purchase Option** (Users can buy food items)
- ☁️ **Cloud Storage** (Images are stored in **Cloudinary**)
- 🔐 **Authentication**
- 📍 **Google Maps Integration** (Location-based features using **Google Maps API**)

---

## ⚙️ Tech Stack
- **Framework:** Next.js
- **Storage:** Cloudinary
- **Real-time Updates:** Pusher
- **Styling:** Tailwind CSS
- **Database:** Prisma
- **Deployment:** Render

---

## 🔧 Installation & Setup
### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/Kamalpannu/YourFoodIsGood.git
cd YourFoodIsGood
```

### **2️⃣ Install Dependencies**
```bash
npm install
```

### **3️⃣ Configure Environment Variables**
Create a `.env` file in the root directory and add the following:
```env
NEXTAUTH_SECRET
JWT_SECRET
NEXT_PUBLIC_PUSHER_APP_ID
NEXT_PUBLIC_PUSHER_KEY
PUSHER_SECRET
NEXT_PUBLIC_PUSHER_CLUSTER
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NEXT_PUBLIC_GOOGLE_MAP_API_KEY
LINK
```

### **4️⃣ Run the Development Server**
```bash
npm run dev
```
Access the app at **http://localhost:3000**.

---

## 🚀 Deployment
### **Deployed To Render**
https://yourfoodisgood4.onrender.com

---

## 📂 Project Structure
```
YourFoodIsGood/
│-- lib/
│-- prisma/
│-- public/
│-- src/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   ├── utils/
│-- .env
│-- .gitignore
│-- README.md
│-- next.config.mjs
│-- package.json
```

---

## 🛠️ Future Enhancements
- ✅ **User Profiles** (Add profile pictures & bio)
- ✅ **Enhanced Payment System** (Integrate Stripe for secure transactions)
- ✅ **Notifications** (Real-time updates on purchases & comments)

---

## 🤝 Contributing
Feel free to **fork** this repository and submit **pull requests**! 😊

---

## 📞 Contact
For any queries, reach out at: **preetkamalsingh986@gmail.com** or find me on GitHub: [Kamalpannu](https://github.com/Kamalpannu)

