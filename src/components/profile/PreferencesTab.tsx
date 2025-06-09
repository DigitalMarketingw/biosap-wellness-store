
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface UserPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  order_updates: boolean;
  newsletter: boolean;
}

const PreferencesTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: true,
    order_updates: true,
    newsletter: false,
  });

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          email_notifications: data.email_notifications,
          sms_notifications: data.sms_notifications,
          marketing_emails: data.marketing_emails,
          order_updates: data.order_updates,
          newsletter: data.newsletter,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Failed to load preferences",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
        });

      if (error) throw error;

      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Save failed",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (fetchLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">Loading preferences...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notification Preferences</h2>
        <p className="text-gray-600">Manage how you receive notifications and updates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose which email notifications you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_notifications">General Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive important updates and account notifications via email
              </p>
            </div>
            <Switch
              id="email_notifications"
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => handlePreferenceChange('email_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="order_updates">Order Updates</Label>
              <p className="text-sm text-gray-500">
                Get notified about order status changes and shipping updates
              </p>
            </div>
            <Switch
              id="order_updates"
              checked={preferences.order_updates}
              onCheckedChange={(checked) => handlePreferenceChange('order_updates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing_emails">Marketing Emails</Label>
              <p className="text-sm text-gray-500">
                Receive promotional offers and product recommendations
              </p>
            </div>
            <Switch
              id="marketing_emails"
              checked={preferences.marketing_emails}
              onCheckedChange={(checked) => handlePreferenceChange('marketing_emails', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="newsletter">Newsletter</Label>
              <p className="text-sm text-gray-500">
                Subscribe to our monthly newsletter with health tips and updates
              </p>
            </div>
            <Switch
              id="newsletter"
              checked={preferences.newsletter}
              onCheckedChange={(checked) => handlePreferenceChange('newsletter', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SMS Notifications</CardTitle>
          <CardDescription>
            Manage SMS notifications for urgent updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms_notifications">SMS Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive text messages for urgent order updates and delivery notifications
              </p>
            </div>
            <Switch
              id="sms_notifications"
              checked={preferences.sms_notifications}
              onCheckedChange={(checked) => handlePreferenceChange('sms_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PreferencesTab;
