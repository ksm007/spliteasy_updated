# SplitSmart

<div align="center">
  <img src="/public/logo.png" alt="SplitSmart Logo" width="200"/>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/Next.js-13+-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Clerk](https://img.shields.io/badge/Clerk-Auth-6633CC)](https://clerk.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
</div>

## 🚀 Overview

SplitSmart is a modern web application that simplifies expense splitting among friends, roommates, or groups. With features like receipt scanning, PDF generation, and real-time expense tracking, managing shared expenses has never been easier.

## ✨ Features

- **Easy Bill Splitting** - Split bills with friends in just a few taps
- **Receipt Scanning** - Upload and scan receipts directly from your device
- **PDF Generation** - Create and download detailed PDF summaries
- **Real-time Updates** - Track payments and balances in real-time
- **Mobile-Friendly** - Works seamlessly across all devices
- **Dark Mode** - Built-in dark theme for comfortable viewing

## 🛠️ Tech Stack

- **Frontend**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **UI Components**: Shadcn/UI
- **Deployment**: Vercel

## 📦 Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- MongoDB Atlas account (for database)
- Clerk account (for authentication)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/splitsmart.git
   cd splitsmart
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## 📂 Project Structure

```
.
├── app/                    # App router pages and layouts
├── components/             # Reusable UI components
├── lib/                    # Utility functions and configurations
├── models/                 # Database models
├── public/                 # Static files
├── styles/                 # Global styles
└── types/                  # TypeScript type definitions
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Clerk Authentication](https://clerk.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

<div align="center">
  Made with ❤️ by Your Name
</div>
