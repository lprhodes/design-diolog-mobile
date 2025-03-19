import React from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    login(credentialResponse);
  };

  const handleError = () => {
    console.error("Login Failed");
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Markdown Viewer</h1>
          <p className="text-gray-600">
            Sign in to access markdown files and comments
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-full max-w-xs mb-4">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
              theme="filled_blue"
              text="continue_with"
              shape="rectangular"
              locale="en"
            />
          </div>

          <p className="text-sm text-gray-500 mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
