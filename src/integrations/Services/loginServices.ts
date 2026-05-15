import { baseUrl } from './baseUrl';

export enum loginQueries {
  POST_LOGIN = 'postLogin',
}

enum loginEndpoints {
  postLogin = import.meta.env.VITE_POST_LOGIN,
}

const postLogin = async (payload: { email: string; password: string }) => {
  try {
    const response = await baseUrl.post(`${loginEndpoints.postLogin}`, payload);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const LoginServices = {
  postLogin,
};
