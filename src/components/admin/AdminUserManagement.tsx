import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { Shield, UserPlus, Users, CheckCircle } from 'lucide-react';

interface AdminUser {
  id: string;
  user_id: string;
  admin_role: string;
  permissions: Record<string, boolean>;
  is_active: boolean;
  profiles: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

const AdminUserManagement = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logAdminActivity } = useAdmin();

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          *,
          profiles!fk_admin_users_profiles(email, first_name, last_name)
        `)
        .eq('is_active', true);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: AdminUser[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        admin_role: item.admin_role,
        permissions: typeof item.permissions === 'object' && item.permissions 
          ? item.permissions as Record<string, boolean>
          : {},
        is_active: item.is_active || false,
        profiles: {
          email: item.profiles?.email || '',
          first_name: item.profiles?.first_name || null,
          last_name: item.profiles?.last_name || null,
        }
      }));
      
      setAdminUsers(transformedData);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin users",
        variant: "destructive",
      });
    }
  };

  const promoteToAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First, check if user exists in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', newAdminEmail.trim())
        .single();

      if (profileError || !profile) {
        toast({
          title: "Error",
          description: "User not found. They need to register first.",
          variant: "destructive",
        });
        return;
      }

      // Update profile role to admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Create admin_users record
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: profile.id,
          admin_role: 'admin',
          permissions: {
            manage_products: true,
            manage_orders: true,
            manage_users: false,
            manage_categories: true,
            manage_inventory: true,
            manage_suppliers: false,
            manage_promotions: true,
            view_analytics: true,
            manage_settings: false,
            view_logs: false
          },
          is_active: true
        });

      if (adminError) throw adminError;

      await logAdminActivity('create', 'admin_user', profile.id, {
        promoted_email: newAdminEmail,
        role: 'admin'
      });

      toast({
        title: "Success",
        description: `${newAdminEmail} has been promoted to admin`,
      });

      setNewAdminEmail('');
      fetchAdminUsers();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: "Failed to promote user to admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (adminUserId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: !currentStatus })
        .eq('id', adminUserId);

      if (error) throw error;

      await logAdminActivity('update', 'admin_user', adminUserId, {
        action: currentStatus ? 'deactivated' : 'activated'
      });

      toast({
        title: "Success",
        description: `Admin user ${currentStatus ? 'deactivated' : 'activated'}`,
      });

      fetchAdminUsers();
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast({
        title: "Error",
        description: "Failed to update admin status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">Admin User Management</h2>
      </div>

      {/* Promote User to Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Promote User to Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="adminEmail">User Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Enter user email to promote"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={promoteToAdmin}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Promoting...' : 'Promote to Admin'}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            The user must already be registered in the system before they can be promoted to admin.
          </p>
        </CardContent>
      </Card>

      {/* Current Admin Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Admin Users ({adminUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No admin users found</p>
            ) : (
              adminUsers.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">
                          {admin.profiles.first_name && admin.profiles.last_name
                            ? `${admin.profiles.first_name} ${admin.profiles.last_name}`
                            : admin.profiles.email}
                        </p>
                        <p className="text-sm text-gray-600">{admin.profiles.email}</p>
                      </div>
                      <Badge 
                        variant={admin.admin_role === 'super_admin' ? 'default' : 'secondary'}
                        className={admin.admin_role === 'super_admin' ? 'bg-green-600' : ''}
                      >
                        {admin.admin_role.replace('_', ' ')}
                      </Badge>
                      {admin.is_active && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAdminStatus(admin.id, admin.is_active)}
                      className={admin.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {admin.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement;
