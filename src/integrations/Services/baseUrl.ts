import axios from 'axios';

const baseUrl = axios.create({
  baseURL: import.meta.env.VITE_SAAS_API_PATH,
});
const ticketUrl = axios.create({
  baseURL: import.meta.env.VITE_TICKET_API_PATH,
});

const Eirasaas_BaseUrl = axios.create({
  baseURL: import.meta.env.VITE_EIRASAAS_API_PATH,
});

export { baseUrl,ticketUrl, Eirasaas_BaseUrl };
