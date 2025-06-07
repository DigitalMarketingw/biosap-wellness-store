
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AdminRole = Database['public']['Enums']['admin_role'];

interface AdminUser {
  id: string;
  user_id: string;
  admin_role: AdminRole;
  permissions: Record<string, boolean>;
  is_active: boolean;
}

interface AdminContextType {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  checkAdminAccess: () => Promise<void>;
  logAdminActivity: (action: string, resourceType: string, resourceId?: string, details?: any) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAdminUser(null);
        setLoading(false);
        return;
      }

      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error || !adminData) {
        setAdminUser(null);
      } else {
        setAdminUser(adminData);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logAdminActivity = async (
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any
  ) => {
    if (!adminUser) return;

    try {
      await supabase.from('admin_activity_logs').insert({
        admin_user_id: adminUser.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: details || {},
      });
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  };

  useEffect(() => {
    checkAdminAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminAccess();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        isAdmin: !!adminUser,
        loading,
        checkAdminAccess,
        logAdminActivity,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
