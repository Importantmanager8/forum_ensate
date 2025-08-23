import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

export const homeService = {
  getHomepageSettings: async () => {
    const response = await axios.get(`${API_BASE_URL}/homepage-settings`);
    return response.data;
  }
};
