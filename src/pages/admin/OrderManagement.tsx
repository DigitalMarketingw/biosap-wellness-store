
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Eye, Edit, Package, Truck, Download, Calendar, Filter, SortAsc, MoreHorizontal, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Navigate } from 'react-router-dom';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  tracking_number?: string;
  tracking_url?: string;
  carrier?: string;
  estimated_delivery?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  shipping_address: any;
  order_items?: Array<{
    id: string;
    quantity: number;
    price: number;
    products: {
      id: string;
      name: string;
      image_urls?: string[];
    };
  }>;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email: string;
    phone_number?: string;
  } | null;
}

const OrderManagement = () => {
  const { adminUser, isAdmin, loading: adminLoading, logAdminActivity } = useAdmin();
  const { user, session, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Partial<Order>>({});

  useEffect(() => {
    // Only fetch orders when we have confirmed authentication and admin status
    if (!authLoading && !adminLoading && user && session && isAdmin) {
      fetchOrders();
    }
  }, [authLoading, adminLoading, user, session, isAdmin]);

  const fetchOrders = async () => {
    // Check if user is authenticated and is admin
    if (!user || !session || !isAdmin) {
      console.error('Authentication required: user=', !!user, 'session=', !!session, 'isAdmin=', isAdmin);
      toast({
        title: "Authentication Error",
        description: "You need to be signed in as an admin to view orders",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching orders as authenticated admin user:', user.id);
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            price,
            products(
              id,
              name,
              image_urls
            )
          ),
          profiles(
            first_name,
            last_name,
            email,
            phone_number
          )
        `);

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (paymentStatusFilter !== 'all') {
        query = query.eq('payment_status', paymentStatusFilter);
      }

      // Apply sorting
      query = query.order(sortField, { ascending: sortDirection === 'asc' });

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Successfully fetched orders:', data?.length || 0);
      setOrders((data as unknown as Order[]) || []);
      await logAdminActivity('view', 'orders');
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please check your permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      // Set timestamps based on status
      if (newStatus === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      } else if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders();
      await logAdminActivity('update', 'orders', orderId, { 
        action: 'status_updated',
        new_status: newStatus 
      });
      
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const updateOrderDetails = async () => {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update(editingOrder)
        .eq('id', selectedOrder.id);

      if (error) throw error;

      await fetchOrders();
      await logAdminActivity('update', 'orders', selectedOrder.id, { 
        action: 'details_updated',
        changes: editingOrder 
      });
      
      setIsEditDialogOpen(false);
      setEditingOrder({});
      
      toast({
        title: "Success",
        description: "Order details updated successfully",
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order details",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.user_id.toLowerCase().includes(searchLower) ||
      (order.profiles?.email && order.profiles.email.toLowerCase().includes(searchLower)) ||
      (order.profiles?.first_name && order.profiles.first_name.toLowerCase().includes(searchLower)) ||
      (order.profiles?.last_name && order.profiles.last_name.toLowerCase().includes(searchLower)) ||
      (order.tracking_number && order.tracking_number.toLowerCase().includes(searchLower)) ||
      order.order_items?.some(item => 
        item.products.name.toLowerCase().includes(searchLower)
      )
    );
  });

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const openEditDialog = (order: Order) => {
    setSelectedOrder(order);
    setEditingOrder({
      tracking_number: order.tracking_number || '',
      tracking_url: order.tracking_url || '',
      carrier: order.carrier || '',
      estimated_delivery: order.estimated_delivery || '',
    });
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    // Only refetch when filters change and we're authenticated
    if (!authLoading && !adminLoading && user && session && isAdmin) {
      fetchOrders();
    }
  }, [statusFilter, paymentStatusFilter, sortField, sortDirection, authLoading, adminLoading, user, session, isAdmin]);

  // Show loading while checking authentication
  if (authLoading || adminLoading) {
    return <div className="p-6">Loading...</div>;
  }

  // Redirect if not authenticated or not admin
  if (!user || !session) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You need admin privileges to access order management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search orders by ID, customer, email, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Select value={`${sortField}-${sortDirection}`} onValueChange={(value) => {
          const [field, direction] = value.split('-');
          setSortField(field);
          setSortDirection(direction as 'asc' | 'desc');
        }}>
          <SelectTrigger className="w-40">
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">Newest First</SelectItem>
            <SelectItem value="created_at-asc">Oldest First</SelectItem>
            <SelectItem value="total_amount-desc">Highest Amount</SelectItem>
            <SelectItem value="total_amount-asc">Lowest Amount</SelectItem>
            <SelectItem value="status-asc">Status A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">#{order.id.slice(0, 8)}</div>
                    {order.tracking_number && (
                      <div className="text-sm text-muted-foreground">
                        Track: {order.tracking_number}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {order.profiles?.first_name} {order.profiles?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.profiles?.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {order.order_items?.length || 0} item(s)
                    </div>
                    {order.order_items && order.order_items.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {order.order_items[0].products?.name}
                        {order.order_items.length > 1 && ` +${order.order_items.length - 1} more`}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium">${Number(order.total_amount).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{order.payment_method}</div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className={getPaymentStatusColor(order.payment_status)}>
                      {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">{format(new Date(order.created_at), 'MMM dd, yyyy')}</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'HH:mm')}</div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openOrderDetail(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(order)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {order.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {order.status === 'processing' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                        >
                          <Truck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'No orders match your search criteria.' : 'No orders have been placed yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
            <DialogDescription>
              Comprehensive order information and management
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-medium">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <Badge variant="outline" className={getPaymentStatusColor(selectedOrder.payment_status)}>
                        {selectedOrder.payment_status?.charAt(0).toUpperCase() + selectedOrder.payment_status?.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="font-medium">${Number(selectedOrder.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{format(new Date(selectedOrder.created_at), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    {selectedOrder.shipped_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipped:</span>
                        <span>{format(new Date(selectedOrder.shipped_at), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    )}
                    {selectedOrder.delivered_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivered:</span>
                        <span>{format(new Date(selectedOrder.delivered_at), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">
                        {selectedOrder.profiles?.first_name} {selectedOrder.profiles?.last_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedOrder.profiles?.email}</span>
                    </div>
                    {selectedOrder.profiles?.phone_number && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{selectedOrder.profiles.phone_number}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <div>{selectedOrder.shipping_address.address_line_1}</div>
                      {selectedOrder.shipping_address.address_line_2 && (
                        <div>{selectedOrder.shipping_address.address_line_2}</div>
                      )}
                      <div>
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}
                      </div>
                      <div>{selectedOrder.shipping_address.country}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        {item.products.image_urls && item.products.image_urls[0] && (
                          <img
                            src={item.products.image_urls[0]}
                            alt={item.products.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{item.products.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity} × ${Number(item.price).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${(item.quantity * Number(item.price)).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Information */}
              {(selectedOrder.tracking_number || selectedOrder.carrier) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tracking Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedOrder.tracking_number && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tracking Number:</span>
                        <span className="font-medium">{selectedOrder.tracking_number}</span>
                      </div>
                    )}
                    {selectedOrder.carrier && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Carrier:</span>
                        <span>{selectedOrder.carrier}</span>
                      </div>
                    )}
                    {selectedOrder.tracking_url && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Track Package:</span>
                        <a href={selectedOrder.tracking_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Open Tracking
                        </a>
                      </div>
                    )}
                    {selectedOrder.estimated_delivery && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Delivery:</span>
                        <span>{format(new Date(selectedOrder.estimated_delivery), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Order Details</DialogTitle>
            <DialogDescription>
              Update tracking and shipping information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="tracking_number">Tracking Number</Label>
              <Input
                id="tracking_number"
                value={editingOrder.tracking_number || ''}
                onChange={(e) => setEditingOrder(prev => ({...prev, tracking_number: e.target.value}))}
                placeholder="Enter tracking number"
              />
            </div>
            
            <div>
              <Label htmlFor="carrier">Carrier</Label>
              <Input
                id="carrier"
                value={editingOrder.carrier || ''}
                onChange={(e) => setEditingOrder(prev => ({...prev, carrier: e.target.value}))}
                placeholder="e.g., FedEx, UPS, DHL"
              />
            </div>
            
            <div>
              <Label htmlFor="tracking_url">Tracking URL</Label>
              <Input
                id="tracking_url"
                value={editingOrder.tracking_url || ''}
                onChange={(e) => setEditingOrder(prev => ({...prev, tracking_url: e.target.value}))}
                placeholder="Full tracking URL"
              />
            </div>
            
            <div>
              <Label htmlFor="estimated_delivery">Estimated Delivery</Label>
              <Input
                id="estimated_delivery"
                type="date"
                value={editingOrder.estimated_delivery || ''}
                onChange={(e) => setEditingOrder(prev => ({...prev, estimated_delivery: e.target.value}))}
              />
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button onClick={updateOrderDetails} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
