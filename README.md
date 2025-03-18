# DataIdea Logger - Frontend

A modern React-based dashboard for the DataIdea Logger service, allowing users to manage API keys and view both event logs and LLM (Large Language Model) interaction logs.

## Features

- **User Authentication**: Secure login and registration
- **Dashboard**: Overview of available features, statistics, and quick-start guide
- **API Key Management**: Create and manage API keys for authentication
- **Dual Logging System**:
  - **Event Logger**: Track application events with severity levels
  - **LLM Logger**: Record AI model interactions with queries and responses
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

## Usage Examples

### Client-Side Integration

Here are examples of how you can integrate the logger into your client applications:

#### Event Logging

```typescript
// utils/logger.ts
import axios from 'axios';

interface EventLogParams {
  apiKey: string;
  userId: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  metadata?: Record<string, any>;
}

export async function logEvent({
  apiKey,
  userId,
  message,
  level,
  metadata = {}
}: EventLogParams): Promise<void> {
  try {
    await axios.post('http://localhost:8000/api/event-log/', {
      api_key: apiKey,
      user_id: userId,
      message,
      level,
      metadata
    });
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

// Usage example
logEvent({
  apiKey: 'your-api-key',
  userId: 'user-123',
  message: 'User clicked checkout button',
  level: 'info',
  metadata: {
    page: 'checkout',
    productIds: ['prod-1', 'prod-2'],
    totalAmount: 129.99
  }
});
```

#### LLM Logging

```typescript
// utils/llmLogger.ts
import axios from 'axios';

interface LlmLogParams {
  apiKey: string;
  userId: string;
  source: string;
  query: string;
  response: string;
  metadata?: Record<string, any>;
}

export async function logLlmInteraction({
  apiKey,
  userId,
  source,
  query,
  response,
  metadata = {}
}: LlmLogParams): Promise<void> {
  try {
    await axios.post('http://localhost:8000/api/llm-log/', {
      api_key: apiKey,
      user_id: userId,
      source,
      query,
      response,
      metadata
    });
  } catch (error) {
    console.error('Failed to log LLM interaction:', error);
  }
}

// Usage example
logLlmInteraction({
  apiKey: 'your-api-key',
  userId: 'user-123',
  source: 'ChatGPT-4',
  query: 'How do I reset my password?',
  response: 'You can reset your password by clicking the "Forgot Password" link on the login page...',
  metadata: {
    modelVersion: 'gpt-4-0613',
    tokens: {
      prompt: 9,
      completion: 24,
      total: 33
    },
    latencyMs: 450
  }
});
```

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
