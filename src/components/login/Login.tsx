import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import CryptoJS from 'crypto-js';
import { useMutation } from '@tanstack/react-query';

import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';

import eiraLogo from '../../assets/images/headerLogo.png';
// import bgImage from '../../assets/images/download.jpg';
import {
  LoginServices,
  loginQueries,
} from '@/integrations/Services/loginServices';

const Login = () => {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [toBackend, setToBackend] = useState(false);

  const navigate = useNavigate();
  const [loginDetails, setLoginDetails] = useState({
    username: '',
    password: '',
  });
  console.log(loginDetails);

  const postLoginMutation = useMutation({
    mutationKey: [loginQueries.POST_LOGIN],
    mutationFn: async (data: { email: string; password: string }) => {
      setToBackend(true);
      return await LoginServices.postLogin(data);
    },
    onSuccess: (e) => {
      window.location.replace('/saas-po/#/po/vendor');
      console.log(e);

      const formattedResponse = {
        userId: e.userId,
        emailId: e.emailId,
        userName: e.userName,
        roleId: e.roleId,
        isNewUser: e.isNewUser,
        firstLogin: e.firstLogin,
        organizationId: e.organizationId,
        organizationName: e.organizationName,
        organizationLogoPath: e.organizationLogoPath,
        accesstoken: e.accessToken,
        // refreshToken: e.refreshToken,
        loginAttempt: e.loginAttempt,
        deviceType: e.deviceType,
        ipAddress: e.ipAddress,

        // 👇 NEW STRUCTURE
        poMapDetails: {
          approverId: e.roleId, // or set static 1 if needed
          userMapDetails: e.userMap || [],
        },
      };

      // ✅ Store correctly
      sessionStorage.setItem('session', JSON.stringify(formattedResponse));
      setToBackend(false);
      toast.success('Login successful!');
    },
    onError: (error) => {
      setToBackend(false);
      toast.error('Login failed. Please check your credentials and try again.');
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    console.log(value);

    setLoginDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  async function onsubmit() {
    const payload = {
      email: loginDetails.username.trim(),
      password: loginDetails.password,
    };
    console.log(loginDetails, 'payload');
    await postLoginMutation.mutateAsync(payload);
  }

  return (
    <div className="relative flex items-center justify-center h-screen overflow-hidden">
      {/* <div
        className="absolute inset-0 bg-cover bg-center blur-[5px] scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      /> */}

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10">
        {isLoginPage ? (
          <LoginComponent
            handleChange={handleChange}
            onsubmit={onsubmit}
            setIsLoginPage={setIsLoginPage}
          />
        ) : (
          <SignupComponent
            handleChange={handleChange}
            onsubmit={onsubmit}
            setIsLoginPage={setIsLoginPage}
          />
        )}
      </div>
    </div>
  );
};

export default Login;

const LoginComponent = ({ handleChange, onsubmit, setIsLoginPage }: any) => {
  return (
    <div className="w-[400px] bg-white rounded-xl shadow-xl flex flex-col items-center p-8">
      <img src={eiraLogo} alt="Logo" className="h-10 mb-6" />

      <h1 className="text-3xl font-bold text-gray-800">Login</h1>

      <p className="text-gray-500 text-center mt-2 mb-6">
        Please login to continue
      </p>

      <Input
        name="username"
        placeholder="C"
        className="mb-4"
        onChange={handleChange}
      />

      <Input
        name="password"
        placeholder="Password"
        type="password"
        className="mb-2"
        onChange={handleChange}
      />

      <p className="text-sm text-blue-500 w-full text-right cursor-pointer hover:underline">
        Forgot Password?
      </p>

      <Button
        className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white"
        onClick={onsubmit}
      >
        Login
      </Button>

      <p className="text-sm text-gray-600 mt-6">
        Don't have an account?{' '}
        <span
          className="text-blue-500 cursor-pointer hover:underline"
          onClick={() => setIsLoginPage(false)}
        >
          Sign Up
        </span>
      </p>
    </div>
  );
};

const SignupComponent = ({ handleChange, onsubmit, setIsLoginPage }: any) => {
  return (
    <div className="w-[400px] bg-white rounded-xl shadow-xl flex flex-col items-center p-8">
      <img src={eiraLogo} alt="Logo" className="h-10 mb-6" />

      <h1 className="text-3xl font-bold text-gray-800">Sign Up</h1>

      <p className="text-gray-500 text-center mt-2 mb-6">Create your account</p>

      <Input
        name="username"
        placeholder="Username"
        className="mb-4"
        onChange={handleChange}
      />

      <Input
        name="password"
        placeholder="Password"
        type="password"
        className="mb-6"
        onChange={handleChange}
      />

      <Button
        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        onClick={onsubmit}
      >
        Sign Up
      </Button>

      <p className="text-sm text-gray-600 mt-6">
        Already have an account?{' '}
        <span
          className="text-blue-500 cursor-pointer hover:underline"
          onClick={() => setIsLoginPage(true)}
        >
          Login
        </span>
      </p>
    </div>
  );
};
