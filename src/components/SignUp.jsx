import React from 'react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';

function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <ClerkSignUp path="/signup" routing="hash" />
    </div>
  );
}
export default SignUp;

