Fenot

Fenot is a powerful, browser‑based data integration and visualization workbench. It allows you to design complex data workflows visually using a canvas, manage metadata for various data sources (files, databases, etc.), create PostgreSQL foreign tables on the fly, and generate executable SQL. With built‑in analytics and visualization nodes, you can transform and explore your data without writing code.
✨ Features

    Visual Job Design – Drag and drop components onto an infinite canvas (powered by React Flow) to build data pipelines.

    Metadata Management – Create and organise metadata for Excel, XML, CSV, JSON, Avro, Parquet, LDIF, database connections and more.

    PostgreSQL Foreign Data Wrappers – Automatically create foreign tables from uploaded files or remote databases, enabling seamless querying.

    Analytics & Visualisation – Apply transformations, aggregations, window functions, and generate charts (bar, line, box plot, etc.) directly from your data.

    SQL Generation & Execution – Validate your workflow and generate optimised PostgreSQL SQL. Execute it against a live database and view results.

    Context‑Aware Configuration – Double‑click any node to open a tailored configuration dialog (e.g., Data Summary, Box Plot).

    Auto‑Save & Persistence – Canvas state is automatically saved to the backend; you can restore previous designs.

    Electron Ready – The frontend can be packaged as a desktop application with minimal changes.

🛠️ Technology Stack

    Frontend: React 18, TypeScript, Vite, Tailwind CSS

    State Management: Redux Toolkit, React Context

    Canvas & Drag‑and‑Drop: React Flow, DnD Kit

    Data Visualisation: ECharts (via dynamically generated specs)

    Backend Integration: REST API (Node.js/Express), PostgreSQL FDW

    Build Tools: npm / yarn, PostCSS, Autoprefixer

📋 Prerequisites

    Node.js 18+ and npm / yarn

    A running backend server (see Backend Repository) that provides:

        PostgreSQL connection management

        Foreign table creation endpoints

        Health checks and query execution

    Note: The backend must be started before the frontend can connect. The default backend URL is http://localhost:3000.

🚀 Installation

    Clone the repository
    bash

    git clone https://github.com/your-org/debo-data-studio.git
    cd debo-data-studio

    Install dependencies
    bash

    npm install
    # or
    yarn

    Configure environment

    Create a .env file in the root directory (optional). The default backend URL is http://localhost:3000. If your backend runs elsewhere, set:
    text

    REACT_APP_BACKEND_URL=http://your-backend-url:3000

    Start the development server
    bash

    npm run dev
    # or
    yarn dev

    The application will be available at http://localhost:5173 (or the next available port).

    Build for production
    bash

    npm run build
    # or
    yarn build

    The output will be in the dist folder.

📜 Available Scripts

In the project directory, you can run:
Script	Description
npm run dev	Starts the Vite development server with hot‑module replacement.
npm run build	Compiles TypeScript and builds the production bundle.
npm run preview	Serves the production build locally for preview.
npm run lint	Runs ESLint on the source code.
npm run typecheck	Runs TypeScript compiler to check types (no emit).
npm run format	Formats code using Prettier (if configured).
🤝 Contributing

We welcome contributions! Please follow these steps:

    Fork the repository and create your feature branch from main.

    Make your changes, ensuring code style and quality:

        Run npm run lint to check for linting errors.

        Run npm run typecheck to verify TypeScript types.

        Add or update tests if applicable (testing setup is not yet included, but we plan to add Jest/React Testing Library).

    Commit your changes with a clear and descriptive commit message.

    Push to your fork and open a Pull Request against the main branch.

    In the PR description, explain what you changed and why. Link any related issues.

Development Guidelines

    Follow the existing code structure and naming conventions.

    Use functional components and hooks.

    Keep components small and focused; extract reusable logic into custom hooks or utility functions.

    Write meaningful comments for complex logic.

    Ensure your changes do not introduce new console errors or warnings.

    Test your changes in both light and dark mode (the application supports theming via CSS variables).

Adding a New Component Type

If you want to add a new analytics or visualisation component:

    Define the component in RightPanel.tsx (add an entry to analyticsComponents or visualizationComponents).

    Create a configuration dialog under components/analytics/ or components/visualization/.

    Register the component in ComponentRegistry.ts (if it’s a source node) and map its role/category.

    Implement the SQL generation logic in sql-generation.service.ts (for analytics) or add a spec builder for visualisations.

    Update the canvas-processor.service.ts to handle the new node type.

Reporting Issues

If you find a bug or have a feature request, please open an issue with a clear description and steps to reproduce.
📄 License

This project is licensed under the MIT License – see the LICENSE file for details.

Happy data wrangling! 🚀