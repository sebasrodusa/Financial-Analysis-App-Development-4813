import React from 'react';
import { SignIn } from '@clerk/clerk-react';

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn path="/login" routing="hash" afterSignInUrl="/dashboard" />
    </div>
  );
}
export default Login;

