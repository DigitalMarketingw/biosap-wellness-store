
import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
            <img 
              src="/lovable-uploads/ab5ccc34-8661-4343-abac-8863eb7e8c1c.png" 
              alt="BIOSAP Logo" 
              className="h-10 w-auto"
            />
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-gray-600">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
