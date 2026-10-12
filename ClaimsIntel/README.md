# ClaimsIntel - Intelligent Claims Management Platform

This repository contains the frontend user interface for **ClaimsIntel**, a comprehensive intelligence and analytics platform designed to streamline and optimize the claims management process. It is a React-based web application built to support real-time dashboards, automated workflows, and document extraction.

---

## 🛠 Tech Stack

* **Framework:** React / Next.js
* **State Management:** Redux Toolkit / Context API
* **Package Manager:** pnpm
* **Assets & Visualization:** Lottie animations, chart libraries for real-time KPIs

---

## ✨ Features

* **Automated Claims Processing:** Speed up the review, validation, and approval of standard claims via an intuitive interface.
* **Fraud Detection Analytics:** Monitor suspicious patterns and flag potentially fraudulent activities with real-time visual alerts.
* **Real-time Dashboard:** Track key performance indicators (KPIs), processing queues, and individual claim statuses live.
* **Document Extraction:** Ingest, review, and verify automatically extracted data from uploaded claim forms, receipts, and documents.
* **Reporting & Export:** Generate detailed analytical summaries and export data seamlessly to CSV and PDF formats.

---

## 📋 Prerequisites

Ensure you have the following installed on your local machine:

* **Node.js** (v16 or higher recommended)
* **pnpm** (The configured package manager for this project)

---

## 🚀 Installation & Setup

1. **Install the required dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure Environment Variables:**
   * Create a `.env` file in the root directory based on the project's required environment configurations to set up API endpoints and keys.

---

## 📜 Available Scripts

In the project directory, you can run:

* **`pnpm start` or `pnpm dev`**: Runs the application in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
* **`pnpm build`**: Builds the app for production, optimizing bundles for maximum performance.
* **`pnpm test`**: Launches the test runner in the interactive watch mode.

---

## 📁 Project Structure

* `/public`: Contains static assets, icons, manifests, and public files.
* `/src`: Contains the core React application code and component architecture.
* `/src/components`: Reusable UI components, dashboard widgets, and data tables.
* `/src/features`: State slices, hooks, and business logic modules.
* **Configuration Files:** Includes `.prettierrc`, `pnpm-lock.yaml`, and environment templates.