# Arakoo Task Manager (ATM)

![image](https://github.com/user-attachments/assets/aced54c5-8ae2-4ac7-8ee8-ce18d44ae34a)


Deployed link : https://atm-omega.vercel.app/auth

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Arakoo Task Manager (ATM) is a full-stack web application built with Next.js that allows users to efficiently manage their personal and company tasks. It features a modern, responsive interface, secure authentication, and decentralized data storage using IPFS.

## Features

- User authentication (email and wallet-based)
- Task creation, editing, and management
- Categorization of tasks (personal and company)
- Real-time notifications for upcoming task deadlines
- Dashboard with task statistics
- Responsive design for mobile and desktop
- Decentralized data storage using IPFS (via Pinata)
- Integration with Web3 wallets

## Tech Stack

- Next.js 13 (App Router)
- React
- TypeScript
- Tailwind CSS
- Magic SDK (for email authentication)
- Web3 integration (ethers.js)
- IPFS / Pinata (for decentralized storage)
- ReCAPTCHA (for form security)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Git

### Installation

1. Clone the repository:

git clone https://github.com/mrselva-eth/reactjs-sample-0225
cd arakoo-task-manager

2. Install dependencies:

npm install

# or

yarn install

3. Set up environment variables (see [Environment Variables](#environment-variables) section)

4. Run the development server:

npm run dev

# or

yarn dev


5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY=your_magic_publishable_key
MAGIC_SECRET_KEY=your_magic_secret_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_api_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key



Make sure to replace the placeholder values with your actual API keys and secrets.

## Usage

1. Sign up for an account using email or connect your Web3 wallet.
2. Once authenticated, you'll be directed to the Task Manager dashboard.
3. Create new tasks by clicking the "+" button.
4. View and manage your tasks in the "Personal" and "Company" tabs.
5. Edit tasks by clicking on them in the task list.
6. Check the dashboard for task statistics and upcoming deadlines.

## Project Structure

arakoo-task-manager/
├── app/
│   ├── auth/
│   ├── dashboard/
│   ├── task-manager/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── tasks/
│   └── ui/
├── lib/
│   ├── ipfs.ts
│   ├── tasks.ts
│   └── utils.ts
├── public/
├── styles/
├── types/
├── .env.local
├── next.config.js
├── package.json
├── README.md
└── tsconfig.json


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


