# Claude.md - Buildly React Template

## Project Overview

**Buildly React Template** is a comprehensive React 17 web application that serves as a frontend template for the Buildly ecosystem. It's designed to work seamlessly with [Buildly Core](https://github.com/buildlyio/buildly-core) backend services and provides a robust foundation for building enterprise-grade applications.

### Key Features
- **Enterprise Authentication**: OAuth integration with user management
- **IoT & Tracking**: Sensor gateways, shipment tracking, and custodian management  
- **Multi-tenant**: Organization selector and role-based access control
- **Internationalization**: i18n support with multiple locales
- **Data Visualization**: Charts, maps, and reporting components
- **PWA Ready**: Service worker and workbox integration
- **Modern Stack**: React 17, Material-UI v5, React Query, Zustand

## Architecture

### Tech Stack
```
Frontend Framework: React 17.0.0
UI Library: Material-UI v5.4.2
State Management: Zustand v4.4.7
Data Fetching: React Query v3.39.3
Routing: React Router DOM v5.3.4
Build Tool: Webpack v4.29.0
Testing: Jest v23.6.0 + Enzyme
Styling: Emotion + SASS
Maps: Google Maps API
Charts: Recharts v2.13.0
```

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Alert/          # Global alert system
│   ├── DataTableWrapper/   # Enhanced data tables
│   ├── MapComponent/   # Google Maps integration
│   ├── Modal/          # Modal dialogs
│   └── ...
├── pages/              # Route-level page components
│   ├── AdminPanel/     # Admin dashboard
│   ├── Custodians/     # Custodian management
│   ├── Shipment/       # Shipment tracking
│   ├── UserManagement/ # User & role management
│   └── ...
├── context/            # React context providers
│   ├── App.context.js  # Global app state
│   └── User.context.js # User authentication state
├── hooks/              # Custom React hooks
│   ├── useAlert.js     # Alert management
│   ├── useAutoLogout.js # Session management
│   └── useCart.js      # Shopping cart functionality
├── zustand/            # Zustand store modules
│   ├── alert/          # Alert state management
│   ├── cart/           # Cart state management
│   └── timezone/       # Timezone handling
├── react-query/        # Data fetching logic
│   ├── queries/        # API query hooks
│   └── mutations/      # API mutation hooks
├── modules/            # Core service modules
│   ├── http/           # HTTP client configuration
│   └── oauth/          # Authentication service
├── routes/             # Routing configuration
├── utils/              # Utility functions
└── styles/             # Theme and styling
```

## Getting Started

### Prerequisites
- Node.js v16.13.0+
- Yarn v1.17.3+
- Buildly Core backend running

### Installation
```bash
# Install dependencies
yarn install

# Initialize project
yarn run init

# Build for development
yarn run build

# Start development server
yarn run start:local
```

### Environment Configuration
Create `.env.development.local` with:
```env
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_OAUTH_CLIENT_ID=your_client_id
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_key
```

### Available Scripts
```bash
yarn start:local       # Dev server (local backend)
yarn start:dev         # Dev server (dev backend)
yarn start:prod        # Dev server (prod backend)
yarn build:dev         # Build for development
yarn build:prod        # Build for production
yarn test              # Run tests in watch mode
yarn test:prod         # Run tests once
yarn test-coverage     # Generate coverage report
yarn lint              # Run ESLint
```

## Core Features

### Authentication & Authorization
- OAuth 2.0 integration via `oauth.service.js`
- JWT token management with auto-refresh
- Protected routes with `PrivateRoute` component
- Role-based access control
- Multi-organization support

### State Management
**React Query** for server state:
- Automatic caching and background updates
- Optimistic updates for mutations
- Error handling and retry logic

**Zustand** for client state:
- Alert notifications
- Shopping cart functionality
- Timezone management
- Lightweight and performant

### UI Components
**Material-UI v5** with custom theming:
- Consistent design system
- Responsive layouts
- Dark/light theme support
- Custom component overrides

**Key Components:**
- `DataTableWrapper`: Enhanced tables with sorting, filtering, pagination
- `MapComponent`: Google Maps integration for location tracking
- `GraphComponent`: Chart visualizations using Recharts
- `UniversalFileViewer`: Multi-format file preview

### Routing System
**React Router v5** with:
- Private route protection
- Nested routing structure
- Route constants for maintainability
- Programmatic navigation

## API Integration

### HTTP Module
Location: `src/modules/http/`
- Axios-based HTTP client
- Request/response interceptors
- Error handling middleware
- Cancel token support

### React Query Integration
```javascript
// Example query hook
import { useQuery } from 'react-query';

const useShipments = () => {
  return useQuery(
    ['shipments'],
    () => httpService.get('/shipments/'),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

// Example mutation hook
import { useMutation, useQueryClient } from 'react-query';

const useCreateShipment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (shipmentData) => httpService.post('/shipments/', shipmentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['shipments']);
      },
    }
  );
};
```

## Development Guidelines

### Component Development
```javascript
// Use functional components with hooks
import React from 'react';
import { useTheme } from '@mui/material/styles';

const MyComponent = ({ prop1, prop2 }) => {
  const theme = useTheme();
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

export default MyComponent;
```

### State Management Patterns
```javascript
// Zustand store example
import { create } from 'zustand';

const useAlertStore = create((set) => ({
  alerts: [],
  addAlert: (alert) => set((state) => ({
    alerts: [...state.alerts, alert]
  })),
  removeAlert: (id) => set((state) => ({
    alerts: state.alerts.filter(alert => alert.id !== id)
  })),
}));
```

### Testing
```javascript
// Component test example
import React from 'react';
import { shallow } from 'enzyme';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<MyComponent prop1="test" />);
    expect(wrapper).toMatchSnapshot();
  });
});
```

## Key Pages & Features

### Admin Panel (`/app/admin`)
- System administration dashboard
- User and role management
- Organization settings
- System monitoring

### Custodians (`/app/custodians`)
- Custodian profile management
- Assignment tracking
- Performance metrics

### Shipment Tracking (`/app/shipment`)
- Real-time shipment monitoring
- GPS tracking integration
- Status updates and notifications
- Route optimization

### Sensor Gateway (`/app/sensors`)
- IoT device management
- Sensor data visualization
- Alert configuration
- Device status monitoring

### User Management (`/app/profile/users`)
- User CRUD operations
- Role assignment
- Group management
- Access control

## Deployment

### Docker Deployment
```bash
# Build Docker image
docker build -t buildly-react-template .

# Run container
docker run -p 3000:80 buildly-react-template
```

### AWS Deployment
```bash
# Use provided deployment script
./scripts/deploy-aws.sh
```

### Environment Builds
- **Local**: Connect to local Buildly Core
- **Development**: Connect to dev environment
- **Production**: Connect to production environment

## Contributing

### Code Standards
- Follow ESLint configuration (Airbnb style guide)
- Use Prettier for code formatting
- Write tests for new components
- Update documentation for new features

### Git Workflow
```bash
# Create feature branch
git checkout -b feat/feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feat/feature-name
```

### PR Requirements
- All tests passing
- ESLint checks passing
- Code coverage maintained
- Documentation updated
- Review approval required

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version compatibility
2. **API Errors**: Verify backend connectivity and CORS settings
3. **Authentication Issues**: Check OAuth configuration
4. **Map Loading**: Verify Google Maps API key

### Debug Mode
```bash
# Enable debug logging
REACT_APP_DEBUG=true yarn start:local
```

### Performance Monitoring
- React DevTools Profiler
- Chrome DevTools Performance tab
- Bundle analyzer for optimization

## Additional Resources

- [Buildly Core Documentation](https://buildly-core.readthedocs.io/)
- [Material-UI Documentation](https://mui.com/)
- [React Query Documentation](https://react-query.tanstack.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## Version Information
- **Current Version**: 1.6.0
- **React Version**: 17.0.0
- **Node Requirement**: v16.13.0+
- **License**: ISC

---

*This documentation is maintained alongside the codebase. Please update it when making significant changes to the application structure or functionality.*
