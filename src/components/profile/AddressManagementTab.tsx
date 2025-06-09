
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AddressDialog from './AddressDialog';

interface Address {
  id: string;
  type: string;
  is_default: boolean;
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

const AddressManagementTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast({
        title: "Failed to load addresses",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      await fetchAddresses();
      toast({
        title: "Address deleted",
        description: "Address has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete address. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;

    try {
      // First, remove default from all addresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Then set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;

      await fetchAddresses();
      toast({
        title: "Default address updated",
        description: "This address is now your default.",
      });
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({
        title: "Update failed",
        description: "Failed to set default address. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatAddress = (address: Address) => {
    return `${address.address_line_1}${address.address_line_2 ? ', ' + address.address_line_2 : ''}, ${address.city}, ${address.state} ${address.postal_code}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">Loading addresses...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Address Management</h2>
            <p className="text-gray-600">Manage your shipping and billing addresses</p>
          </div>
          <Button 
            onClick={() => {
              setEditingAddress(null);
              setDialogOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        </div>

        {addresses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
              <p className="text-gray-500 text-center mb-4">
                Add your first address to make checkout faster and easier.
              </p>
              <Button 
                onClick={() => {
                  setEditingAddress(null);
                  setDialogOpen(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <Card key={address.id} className={address.is_default ? 'ring-2 ring-green-500' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {address.first_name} {address.last_name}
                      </CardTitle>
                      <div className="flex gap-2">
                        {address.is_default && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Default
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {address.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingAddress(address);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {address.company && (
                      <p className="text-sm text-gray-600">{address.company}</p>
                    )}
                    <p className="text-sm">{formatAddress(address)}</p>
                    <p className="text-sm text-gray-600">{address.country}</p>
                    {address.phone && (
                      <p className="text-sm text-gray-600">{address.phone}</p>
                    )}
                  </div>
                  {!address.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        address={editingAddress}
        onSave={fetchAddresses}
      />
    </>
  );
};

export default AddressManagementTab;
