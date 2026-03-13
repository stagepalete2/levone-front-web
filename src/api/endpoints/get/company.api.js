
import axios from 'axios'

const PUBLIC_DOMAIN = import.meta.env.VITE_PUBLIC_DOMAIN || import.meta.env.VITE_BACKEND_DOMAIN

const getCompany = async ({ company }) => {
    try {
      const response = await axios.get(`https://${PUBLIC_DOMAIN}/api/v1/company/${company}/`);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error("API error:", error.response.data);

        if (error.response.status === 404) {
          return null;
        }

        throw new Error(error.response.data?.error || "Request failed");
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error(error.message);
      }
    }
};

export default getCompany;
