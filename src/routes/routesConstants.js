// Define a centralized list of route paths used throughout the application
// This improves maintainability and prevents hardcoding strings across components

export const routes = {
  // Authentication-related routes
  LOGIN: '/login', // Login page
  REGISTER: '/register', // Registration page
  RESET_PASSWORD: '/reset-password', // Reset password request page
  RESET_PASSWORD_CONFIRM: '/reset-password-confirm', // Password reset confirmation page
  VERIFICATION: '/verification', // Email or account verification page

  // Base application shell route
  APP: '/app', // Root path for all authenticated app routes

  // Custodian management
  CUSTODIANS: '/app/custodians', // Page for managing custodians

  // User management routes
  USER_MANAGEMENT: '/app/profile/users', // Main user management page
  CURRENT_USERS: '/app/profile/users/current-users', // Sub-route for listing current users
  USER_GROUPS: '/app/profile/users/groups', // Sub-route for managing user groups/roles

  // Informational pages
  ABOUT_PLATFORM: '/app/about-platform', // Page with information about the platform
  PRIVACY_POLICY: '/app/privacy-policy', // Page for the app’s privacy policy

  // Core app functionality
  ITEMS: '/app/items', // Page for listing or managing items
  TRACKERS: '/app/trackers', // Page for managing or viewing trackers
  SHIPMENT: '/app/shipment', // Page for viewing or managing shipments
  CREATE_SHIPMENT: '/app/create-shipment', // Page to initiate a new shipment

  // Reporting
  REPORTING: '/app/reporting', // Page for generating and viewing reports

  // Admin panel and advanced configuration
  ADMIN_PANEL: '/app/admin-panel', // Base admin panel route
  CONFIGURATION: '/app/admin-panel/configuration', // App/system configuration page
  CONSORTIUM: '/app/admin-panel/consortium', // Consortium management page
  ADMIN_TRACKERS: '/app/admin-panel/trackers', // Tracker management from admin panel
  TRACKERORDER: '/app/admin-panel/orders', // Order management from admin panel
  INVOICES: '/app/admin-panel/invoices', // Invoices and billing management

  // Potential future route (commented out)
  // IMPORT_EXPORT: '/app/admin-panel/import-export', // Import/export functionality
};
