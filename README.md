# DataIdea Logger - Frontend

A modern React-based dashboard for the DataIdea Logger service, allowing users to manage API keys and view application logs.

## Features

- **User Authentication**: Secure login and registration
- **Dashboard**: Overview of available features and quick-start guide
- **API Key Management**: Create and manage API keys for authentication
- **Log Viewer**: View, search, and filter logs sent to the service
- **User Profile**: Manage user account settings

## Technologies Used

- **React 18**: Modern UI library for building interactive interfaces
- **TypeScript**: Type-safe JavaScript for better developer experience
- **Vite**: Next-generation frontend tooling for fast development
- **Material UI**: Component library for consistent and responsive design
- **React Router**: Client-side routing for single-page application
- **JWT Authentication**: Secure user authentication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-org/dataidea-logger.git
   cd dataidea-logger/frontend
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   ```

3. Configure environment variables
   Create a `.env` file in the frontend directory with the following:
   ```
   VITE_API_URL=http://localhost:8000
   ```

4. Start the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Access the application at `http://localhost:5173`

## Building for Production

To create a production build:

```
npm run build
# or
yarn build
```

The build files will be generated in the `dist` directory.

## Connecting to the Backend

The frontend expects a DataIdea Logger backend service running at the URL specified in the `VITE_API_URL` environment variable. See the backend README for instructions on setting up the API service.

## Project Structure

```
src/
├── assets/         # Static assets like images and icons
├── components/     # Reusable UI components
├── context/        # React context for state management
├── App.tsx         # Main application component
├── App.css         # Application-specific styles
├── index.css       # Global styles
└── main.tsx        # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
