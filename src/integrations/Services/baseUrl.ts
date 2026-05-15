import axios from 'axios';

const baseUrl = axios.create({
  baseURL: import.meta.env.VITE_PO_API_PATH,
});

const Eirasaas_BaseUrl = axios.create({
  baseURL: import.meta.env.VITE_EIRASAAS_API_PATH,
});

export { baseUrl, Eirasaas_BaseUrl };
