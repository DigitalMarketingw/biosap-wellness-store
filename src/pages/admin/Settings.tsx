
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Save, RotateCcw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';

interface SystemSetting {
  key: string;
  value: any;
  description: string;
  category: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { logAdminActivity } = useAdmin();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;

      const settingsMap = data?.reduce((acc, setting) => {
        // Parse JSON values properly
        try {
          acc[setting.key] = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
        } catch {
          // If JSON parsing fails, use the raw value
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      setSettings(settingsMap);
      await logAdminActivity('view', 'system_settings');
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any, description?: string, category?: string) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key,
          value: JSON.stringify(value),
          description: description || '',
          category: category || 'general',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
      await logAdminActivity('update', 'system_settings', undefined, { key, value });
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save all modified settings
      await Promise.all([
        updateSetting('store_name', settings.store_name || '', 'Store name displayed to customers', 'general'),
        updateSetting('store_email', settings.store_email || '', 'Store contact email', 'general'),
        updateSetting('store_phone', settings.store_phone || '', 'Store contact phone', 'general'),
        updateSetting('currency', settings.currency || 'INR', 'Default store currency', 'financial'),
        updateSetting('tax_rate', settings.tax_rate || 0, 'Default tax rate percentage', 'financial'),
        updateSetting('shipping_fee', settings.shipping_fee || 0, 'Default shipping fee', 'shipping'),
        updateSetting('free_shipping_threshold', settings.free_shipping_threshold || 1000, 'Free shipping minimum order amount', 'shipping'),
        updateSetting('low_stock_threshold', settings.low_stock_threshold || 10, 'Low stock alert threshold', 'inventory'),
        updateSetting('email_notifications', settings.email_notifications || false, 'Enable email notifications', 'email'),
        updateSetting('order_confirmation_email', settings.order_confirmation_email || true, 'Send order confirmation emails', 'email'),
        updateSetting('maintenance_mode', settings.maintenance_mode || false, 'Enable maintenance mode', 'security'),
        updateSetting('max_login_attempts', settings.max_login_attempts || 5, 'Maximum login attempts before lockout', 'security')
      ]);

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) return;

    const defaultSettings = {
      store_name: 'Ayurvedic Store',
      store_email: 'info@ayurvedicstore.com',
      store_phone: '+91 9876543210',
      currency: 'INR',
      tax_rate: 18,
      shipping_fee: 50,
      free_shipping_threshold: 1000,
      low_stock_threshold: 10,
      email_notifications: true,
      order_confirmation_email: true,
      maintenance_mode: false,
      max_login_attempts: 5
    };

    setSettings(defaultSettings);
    toast({
      title: "Info",
      description: "Settings reset to defaults. Click Save to apply changes.",
    });
  };

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">System configuration and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search settings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store_name">Store Name</Label>
                  <Input
                    id="store_name"
                    value={settings.store_name || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, store_name: e.target.value }))}
                    placeholder="Enter store name"
                  />
                </div>
                <div>
                  <Label htmlFor="store_email">Store Email</Label>
                  <Input
                    id="store_email"
                    type="email"
                    value={settings.store_email || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, store_email: e.target.value }))}
                    placeholder="Enter store email"
                  />
                </div>
                <div>
                  <Label htmlFor="store_phone">Store Phone</Label>
                  <Input
                    id="store_phone"
                    value={settings.store_phone || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, store_phone: e.target.value }))}
                    placeholder="Enter store phone"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={settings.currency || 'INR'} onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    value={settings.tax_rate || 0}
                    onChange={(e) => setSettings(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter tax rate"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipping_fee">Default Shipping Fee</Label>
                  <Input
                    id="shipping_fee"
                    type="number"
                    step="0.01"
                    value={settings.shipping_fee || 0}
                    onChange={(e) => setSettings(prev => ({ ...prev, shipping_fee: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter shipping fee"
                  />
                </div>
                <div>
                  <Label htmlFor="free_shipping_threshold">Free Shipping Threshold</Label>
                  <Input
                    id="free_shipping_threshold"
                    type="number"
                    step="0.01"
                    value={settings.free_shipping_threshold || 1000}
                    onChange={(e) => setSettings(prev => ({ ...prev, free_shipping_threshold: parseFloat(e.target.value) || 1000 }))}
                    placeholder="Enter free shipping threshold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600">Enable system email notifications</p>
                </div>
                <Switch
                  checked={settings.email_notifications || false}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email_notifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Order Confirmation Emails</Label>
                  <p className="text-sm text-gray-600">Send order confirmation emails to customers</p>
                </div>
                <Switch
                  checked={settings.order_confirmation_email !== false}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, order_confirmation_email: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="low_stock_threshold">Low Stock Alert Threshold</Label>
                <Input
                  id="low_stock_threshold"
                  type="number"
                  value={settings.low_stock_threshold || 10}
                  onChange={(e) => setSettings(prev => ({ ...prev, low_stock_threshold: parseInt(e.target.value) || 10 }))}
                  placeholder="Enter low stock threshold"
                />
                <p className="text-sm text-gray-600 mt-1">Products with stock below this number will be marked as low stock</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Enable maintenance mode to restrict access</p>
                </div>
                <Switch
                  checked={settings.maintenance_mode || false}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenance_mode: checked }))}
                />
              </div>
              <div>
                <Label htmlFor="max_login_attempts">Maximum Login Attempts</Label>
                <Input
                  id="max_login_attempts"
                  type="number"
                  value={settings.max_login_attempts || 5}
                  onChange={(e) => setSettings(prev => ({ ...prev, max_login_attempts: parseInt(e.target.value) || 5 }))}
                  placeholder="Enter max login attempts"
                />
                <p className="text-sm text-gray-600 mt-1">Number of failed attempts before account lockout</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
