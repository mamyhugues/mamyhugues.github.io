// Wrapper for HTTP requests with Axios
import axios from 'axios';

const apif = axios.create({
   baseURL: 'http://localhost:8000/api',
   responseType: 'blob'
});

// Add an interceptor for all requests
apif.interceptors.request.use(config => {
   const user = JSON.parse(localStorage.getItem("user"));
   // Retrieve the access token from React state or a state management system
   const accessToken = user.token;

   // Add the access token to the Authorization header
   config.headers.Authorization = `Bearer ${accessToken}`;

   return config;
});

export default apif;