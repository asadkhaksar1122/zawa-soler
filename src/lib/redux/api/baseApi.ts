
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a base API slice using createApi
// We are not defining endpoints here, as they will be injected.
export const baseApi = createApi({
  reducerPath: 'api', // Specifies where this API slice's reducer will be mounted in the Redux state
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }), // Configures the base URL for all API requests
  tagTypes: ['Solutions', 'Solution', 'Companies', 'ContactSettings', 'User', "Dashboard"], // Declare tag types used by endpoints
  endpoints: () => ({}), // Endpoints will be injected using injectEndp,oints
});

