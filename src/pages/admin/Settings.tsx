
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, Cog } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">System configuration and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Cog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Panel Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              This feature will allow you to configure system settings, preferences, and business rules.
            </p>
            <p className="text-sm text-gray-500">
              Features will include: store configuration, payment settings, email templates, and system preferences.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
