# SplitEasy - Smart Bill Splitting Application

SplitEasy is a modern web application that simplifies splitting bills among friends and groups. With features like receipt scanning, automatic item assignment, and PDF generation, it makes managing shared expenses effortless.

![SplitEasy Banner](/public/dashboard-normal.png)

## Features

- **Easy Bill Splitting** - Split bills with friends in just a few taps
- **Receipt Scanning** - Upload and scan receipts with automatic item extraction
- **Smart Assignment** - Easily assign items to participants
- **PDF Generation** - Create and download detailed PDF summaries
- **Mobile-Friendly** - Responsive design works on all devices
- **User Authentication** - Secure sign-in with Clerk
- **Dark Mode** - Built-in dark theme support

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: Shadcn UI, Radix UI
- **Authentication**: Clerk
- **Database**: MongoDB with Prisma ORM
- **AI/ML**: Google Generative AI for receipt processing
- **PDF Generation**: @react-pdf/renderer
- **State Management**: React Query
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB database
- Clerk account for authentication
- Google Cloud account for Vision AI (optional)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/spliteasy.git
   cd spliteasy
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

   ```
   DATABASE_URL="your_mongodb_connection_string"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   GOOGLE_AI_KEY=your_google_ai_key
   ```

4. Run database migrations:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/                    # App router
│   ├── api/                # API routes
│   ├── dashboard/          # Dashboard page
│   ├── transactions/       # Transaction pages
│   ├── upload/             # Receipt upload page
│   └── layout.tsx          # Root layout
├── components/             # Reusable components
├── lib/                    # Utility functions
├── prisma/                 # Database schema
├── public/                 # Static files
└── styles/                 # Global styles
```

## Usage

1. **Sign Up/Login**: Create an account or sign in with your credentials.
2. **Create a New Split**: Click "New Split" on the dashboard.
3. **Upload Receipt**: Take a photo or upload an image of your receipt.
4. **Review Items**: The app will extract items from the receipt.
5. **Assign Items**: Assign items to participants.
6. **Generate Split**: View the final split and download as PDF.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with Next.js and the App Router
- Styled with Tailwind CSS and Shadcn UI
- Authentication powered by Clerk
- Database powered by MongoDB and Prisma
- Receipt processing with Google's Generative AISmart


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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Clerk Authentication](https://clerk.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

<div align="center">
  Made with ❤️ by Kartik Marathe
</div>
