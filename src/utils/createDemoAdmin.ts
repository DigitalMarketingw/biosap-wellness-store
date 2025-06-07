
import { supabase } from '@/integrations/supabase/client';

export const createDemoAdminUser = async () => {
  try {
    // First, sign up the user through Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: 'kanishkshkla@gmail.com',
      password: 'Plants@2025',
      options: {
        data: {
          first_name: 'Kanishk',
          last_name: 'Shukla',
          role: 'admin'
        }
      }
    });

    if (signUpError) {
      console.error('Error creating demo admin user:', signUpError);
      return { error: signUpError };
    }

    if (data.user) {
      // Update the profile to admin role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Error updating profile role:', profileError);
      }

      // Add to admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: data.user.id,
          admin_role: 'super_admin',
          permissions: {
            manage_products: true,
            manage_orders: true,
            manage_users: true,
            view_analytics: true
          },
          is_active: true
        });

      if (adminError) {
        console.error('Error creating admin user record:', adminError);
      }

      return { success: true, user: data.user };
    }

    return { error: 'No user created' };
  } catch (error) {
    console.error('Error in createDemoAdminUser:', error);
    return { error };
  }
};
