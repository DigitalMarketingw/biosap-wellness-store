
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

const AdminNotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Admin Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The admin page you're looking for doesn't exist or you don't have permission to access it.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/admin">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
          <Link to="/">
            <Button className="bg-green-600 hover:bg-green-700">
              <Home className="mr-2 h-4 w-4" />
              Back to Store
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminNotFound;
