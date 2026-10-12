# Intelliforge - Agentic AI Transformation Pipeline

This repository contains the frontend user interface for the **Intelliforge - Agentic AI Transformation Pipeline**. It is a React-based web application that utilizes Redux for state management, specifically designed to support advanced chat and AI agent interactions.

## 🛠 Tech Stack
* **Framework:** React
* **State Management:** Redux Toolkit
* **Package Manager:** pnpm
* **Assets:** Lottie animations, PDF.js (worker)

## ✨ Features
* **Agentic Chat Interface:** Includes a chatbot UI with dynamic typing animations (`typing.json`) and various AI agent avatars (`Chatbot.png`, `orange_agent.png`, `avatar1.png`).
* **Robust State Management:** Utilizes Redux to handle application state, ensuring smooth management of complex chat pipelines via `chatSlice.js` and `store.js`.
* **Integrated PDF Handling:** Implements a PDF worker (`pdf.worker.min.mjs`) for in-app processing and rendering of document-based workflows.

## 📋 Prerequisites
Ensure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/) (v16 or higher recommended)
* [pnpm](https://pnpm.io/) (The configured package manager for this project)

## 🚀 Installation & Setup

1. Clone the repository and navigate into the project directory:
   ```bash
   cd intelliforge-ui
   ```
2. Install the required dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env` file in the root directory based on the project's required environment configurations.

## 📜 Available Scripts

In the project directory, you can run:

* `pnpm start` or `pnpm dev`: Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
* `pnpm build`: Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.
* `pnpm test`: Launches the test runner in the interactive watch mode.

## 📁 Project Structure
* **`/public`**: Contains static assets, including `index.html`, `manifest.json`, and `robots.txt`.
* **`/src`**: Contains the core React application code (`App.js`, `App.css`, `App.test.js`).
  * **`/src/app`**: Contains the Redux store configuration and state slices.
  * **`/src/assets`**: Contains application imagery, UI icons, and Lottie animations.
* **Configuration Files**: Includes `.prettierrc` for code formatting rules and `pnpm-lock.yaml` for dependency version locking.