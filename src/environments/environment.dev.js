// Configuration for development environment

const API_URL = "https://tp-dev-api.buildly.io/";
const MAP_API_KEY = "AIzaSyBcFCjQsHImeUy8jJQLW37ucWUKKmJwLd0";

export const environment = window['environment'] || {
  API_URL,
  OAUTH_CLIENT_ID: "pljxXjxQbtzLbh8pPQG3xLLrW6tC6XghOp2OGCUS",
  OAUTH_TOKEN_URL: `${API_URL}oauth/token/`,
  MAP_API_KEY,
  MAP_API_URL: `https://maps.googleapis.com/maps/api/js?key=${MAP_API_KEY}&v=3.exp&libraries=geometry,drawing,places`,
  GEO_CODE_API: "AIzaSyDw-lNn69CSWKBGz97HeVuJQKIhiVLcFyE",
  production: false,
};
