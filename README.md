WeatherIntel
An AI-powered weather forecasting application that provides real-time weather data, intelligent insights, and tailored activity recommendations for any city worldwide.

Features
Instant Weather Search: Search for any city to retrieve real-time forecasts and current conditions.

AI-Generated Insights: Automated analysis breaking down weather trends, severe conditions, and notable changes.

Smart Recommendations: Context-aware suggestions for outdoor activities, clothing, and travel based on the live forecast.

Responsive Dashboard: Modern UI built for seamless interaction across desktop and mobile devices.

Tech Stack
Frontend: React 19, Vite, Tailwind CSS v4, Motion (Framer Motion), Lucide React

Backend: Express.js

AI Integration: @google/genai (Google Gemini SDK)

Runtime & Package Manager: Bun

Getting Started
Prerequisites
Bun installed on your local machine.

A Google Gemini API key.

Local Installation
Clone the repository:

Bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME
Install dependencies:

Bash
bun install
Configure Environment Variables:
Create a .env file in the root directory and add your Google Gemini API key:

Code snippet
GEMINI_API_KEY=your_gemini_api_key_here
Run the development server:

Bash
bun run dev
Deployment
This application is configured for continuous deployment on Cloudflare Pages.

When deploying manually or through CI/CD:

Set SKIP_DEPENDENCY_INSTALL to true in your build environment variables.

Set the Build Command to bun install && bun run build.

Add your GEMINI_API_KEY to your Cloudflare Environment Variables.
