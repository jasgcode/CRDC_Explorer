# CRDC Integrator

CRDC Integrator is a React-based web application that allows users to explore and analyze data from NCI Genomic Data Commons (GDC) and NCI Imaging Data Commons (IDC) through an intuitive interface.

## Features

- **Collection Management**: Browse and select from various data collections
- **Advanced Filtering**:
  - Filter by primary sites
  - Filter by disease types
  - Filter by experimental strategies
  - Filter by data categories
- **Patient Data Exploration**:
  - Search for specific patient IDs
  - View genomic data
  - Access imaging data
  - View integrated data visualization
- **Real-time Updates**: Dynamic loading and filtering of patient data
- **Responsive Design**: Works on desktop and tablet devices

## Tech Stack

- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Axios for API calls
- Flask backend service

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v16+)
- Python 3.8+
- pip (Python package installer)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/crdc-integrator.git
cd crdc-integrator
```

2. Install frontend dependencies:
```bash
npm ci
```

3. Install backend dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Development

1. Start the backend server:
```bash
cd app
python app.py
```

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`
## Docker Deployment

The application can be run using Docker containers. Here's how to set it up:

### Configuration Notes

1. **Vite Configuration**
The `vite.config.ts` has different settings for Docker vs local development:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    // For Docker deployment:
    host: true,     // Enable this for Docker
    port: 5173,     // Enable this for Docker
    proxy: {
      '/api': {
        target: 'http://backend:5001',  // Use this URL for Docker
        // target: 'http://localhost:5001',  // Use this URL for local development
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      }
    }
  }
})
```

### Running with Docker

1. **Using Docker Compose**
```bash
# Build and start the containers
docker-compose up --build

# To run in detached mode
docker-compose up -d

# To stop the containers
docker-compose down
```

2. **Accessing the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

### Container Structure
```
docker-compose
├── frontend           # React application
│   ├── Port: 5173
│   └── Dependencies: backend
└── backend           # Flask API server
    └── Port: 5001
```

### Development vs Docker Settings

When switching between local development and Docker deployment:

1. **For Local Development:**
```typescript
// vite.config.ts
server: {
  // Comment out or remove host and port
  proxy: {
    '/api': {
      target: 'http://localhost:5001',  // Use localhost
      // ...
    }
  }
}
```

2. **For Docker Deployment:**
```typescript
// vite.config.ts
server: {
  host: true,     // Enable
  port: 5173,     // Enable
  proxy: {
    '/api': {
      target: 'http://backend:5001',  // Use container name
      // ...
    }
  }
}
```

### Troubleshooting Docker Setup

1. **Container Communication**
- Ensure the backend service name in `docker-compose.yml` matches the proxy target in `vite.config.ts`
- Default backend container name is `backend`

2. **Port Conflicts**
- Make sure ports 5173 and 5001 are available on your host machine
- To use different ports, update both `docker-compose.yml` and `vite.config.ts`

3. **Common Issues**
```bash
# View container logs
docker-compose logs

# Restart containers
docker-compose restart

# Rebuild containers after config changes
docker-compose up --build
```
## Project Structure

```
src/
├── api/              # API services and types
├── components/       # React components
│   ├── Data/        # Data visualization components
│   │   ├── cards/   # Data card components
│   │   ├── panels/  # Panel components
│   │   └── shared/  # Shared components
│   └── Filters/     # Filter-related components
├── hooks/           # Custom React hooks
├── types/           # TypeScript interfaces
├── utils/           # Utility functions
└── styles/          # Global styles
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript compiler check

## API Integration

The application integrates with:
- GDC API for genomic data
- IDC API for imaging data
- Local Flask backend for data processing

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a Pull Request

## Configuration

Key configuration files:
- `vite.config.ts`: Vite configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration

## API Configuration

The application requires the following API endpoints to be configured:
```typescript
export const API_CONFIG = {
  GDC: {
    BASE_URL: 'https://api.gdc.cancer.gov',
    ENDPOINTS: {
      PROJECTS: '/projects',
      CASES: '/cases',
      FILES: '/files',
      DATA: '/data'
    }
  },
  LOCAL: {
    BASE_URL: '/api'
  }
};
```

## Known Issues

- Large datasets may cause performance issues in the filter panel
- Search functionality is case-sensitive
- Some browser-specific styling inconsistencies

## Future Improvements

- Add unit tests
- Implement data caching
- Add export functionality
- Improve mobile responsiveness
- Add history of patient selections
- Implement advanced visualization features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- NCI Genomic Data Commons
- NCI Imaging Data Commons
- Biodepot LLC

