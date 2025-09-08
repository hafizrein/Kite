us# Kite - Professional Services Automation Platform

Kite is a comprehensive, all-in-one platform designed to streamline operations for professional services organizations. It integrates Project Management, Customer Relationship Management (CRM), and AI-powered optimization tools into a single, intuitive interface. Built with a modern tech stack, Kite provides a robust and scalable solution for managing your business.

## ✨ Key Features

- **📊 Interactive Dashboard**: Get a real-time overview of your business with key metrics like revenue, project progress, and sales pipeline value.
- **📁 Project Management**:
    - Manage projects from initiation to completion.
    - Track status, budget, progress, and performance indicators (CPI & SPI).
    - Filter and search projects for easy access.
    - **Work Breakdown Structure (WBS)**: Decompose complex projects into manageable tasks, phases, and milestones with a hierarchical tree view.
- **🤝 Customer Relationship Management (CRM)**:
    - **Accounts Management**: Maintain a central repository of all your customer accounts, including contact information and interaction history.
    - **Opportunity Pipeline**: Track potential deals from lead to close, with detailed information on value, probability, and stage.
    - **Seamless Conversion**: Convert a "Won" opportunity into a new project with a single click.
- **⏱️ Timesheets**:
    - Easily log time against specific projects.
    - Weekly grid view for quick entry and overview.
    - Track billable vs. non-billable hours.
- **📈 Reporting & Analytics**:
    - In-depth reports on project performance, including CPI/SPI heatmaps and trend analysis.
    - Filter reports by manager or time period to gain specific insights.
- **🤖 AI-Powered Optimization**:
    - Leverage generative AI to get intelligent suggestions for resource allocation.
    - Optimize team assignments based on project descriptions, member skills, and availability to enhance project outcomes.
- **⚙️ Comprehensive Settings**:
    - Manage user profiles, organization details, and security settings.
    - Define custom rate cards for different roles and departments.
    - Configure notification preferences.
- **🔐 Authentication & Authorization**:
    - Secure user authentication with Email/Password and Google sign-in.
    - Role-based access control (Admin, Manager, Employee) to ensure users only see what they need to.
- **🏢 Multi-Organization Support**: Switch between different company workspaces seamlessly from the sidebar.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router with Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Component Library**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit)
- **Backend Services**:
    - **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
    - **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Deployment**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## 🔧 Getting Started

This project is configured to run in a cloud development environment like Firebase Studio.

### Prerequisites

- A Firebase project with Authentication (Email/Password and Google providers enabled) and Firestore activated.
- Node.js and npm installed.

### Environment Configuration

Create a `.env` file in the root of the project and add your Firebase project's configuration keys:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Additionally, for the Genkit AI features to work, you need to provide a Google AI API key:

```bash
GEMINI_API_KEY=your_google_ai_api_key
```

### Running the Development Server

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Next.js development server:**
    This command starts the main web application.
    ```bash
    npm run dev
    ```

3.  **Run the Genkit development server (in a separate terminal):**
    This command starts the Genkit server to handle AI-related requests.
    ```bash
    npm run genkit:dev
    ```

The application should now be running on `http://localhost:3000`.
