
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { Plus, Edit, Trash2, Tag, Search, Upload, Link } from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  image_url: string | null;
  category_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  categories?: { name: string };
}

interface Category {
  id: string;
  name: string;
}

const SubcategoryManagement = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [imageMethod, setImageMethod] = useState<'upload' | 'url'>('url');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    image_url: '',
    category_id: '',
    sort_order: 0
  });
  const { toast } = useToast();
  const { logAdminActivity } = useAdmin();

  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select(`
          *,
          categories!subcategories_category_id_fkey(name)
        `)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subcategories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({ 
      ...formData, 
      name,
      slug: editingSubcategory ? formData.slug : generateSlug(name)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Subcategory name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.slug.trim()) {
      toast({
        title: "Error",
        description: "Subcategory slug is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const submitData = {
        ...formData,
        category_id: formData.category_id || null,
        sort_order: Number(formData.sort_order)
      };

      if (editingSubcategory) {
        const { error } = await supabase
          .from('subcategories')
          .update(submitData)
          .eq('id', editingSubcategory.id);

        if (error) throw error;

        await logAdminActivity('update', 'subcategory', editingSubcategory.id);
        toast({
          title: "Success",
          description: "Subcategory updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('subcategories')
          .insert([submitData]);

        if (error) throw error;

        await logAdminActivity('create', 'subcategory');
        toast({
          title: "Success",
          description: "Subcategory created successfully",
        });
      }

      setFormData({ name: '', description: '', slug: '', image_url: '', category_id: '', sort_order: 0 });
      setEditingSubcategory(null);
      setShowForm(false);
      setImageMethod('url');
      fetchSubcategories();
    } catch (error: any) {
      console.error('Error saving subcategory:', error);
      toast({
        title: "Error",
        description: error.message?.includes('duplicate key') ? 'Slug already exists' : 'Failed to save subcategory',
        variant: "destructive",
      });
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      description: subcategory.description || '',
      slug: subcategory.slug,
      image_url: subcategory.image_url || '',
      category_id: subcategory.category_id || '',
      sort_order: subcategory.sort_order
    });
    setShowForm(true);
  };

  const handleDelete = async (subcategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', subcategoryId);

      if (error) throw error;

      await logAdminActivity('delete', 'subcategory', subcategoryId);
      toast({
        title: "Success",
        description: "Subcategory deleted successfully",
      });
      fetchSubcategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to delete subcategory",
        variant: "destructive",
      });
    }
  };

  const filteredSubcategories = subcategories.filter(subcategory =>
    subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subcategory.description && subcategory.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const resetForm = () => {
    setEditingSubcategory(null);
    setFormData({ name: '', description: '', slug: '', image_url: '', category_id: '', sort_order: 0 });
    setImageMethod('url');
    setShowForm(true);
  };

  if (loading) {
    return <div className="p-6">Loading subcategories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subcategory Management</h1>
          <p className="text-gray-600">Manage product subcategories and wellness categories</p>
        </div>
        <Button 
          onClick={resetForm}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subcategory
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search subcategories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Subcategory Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Subcategory name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-friendly-name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Subcategory description"
                />
              </div>

              <div>
                <Label htmlFor="category">Parent Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No parent category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image_url && (
                  <div className="mt-2 aspect-video w-full max-w-sm rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                    <img 
                      src={formData.image_url}
                      alt="Subcategory preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load image URL:', formData.image_url);
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingSubcategory ? 'Update' : 'Create'} Subcategory
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Subcategories List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Subcategories ({filteredSubcategories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubcategories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {searchTerm ? 'No subcategories found matching your search.' : 'No subcategories found. Create your first subcategory!'}
              </p>
            ) : (
              filteredSubcategories.map((subcategory) => (
                <div key={subcategory.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    {subcategory.image_url && (
                      <img 
                        src={subcategory.image_url} 
                        alt={subcategory.name}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-green-200"
                        onError={(e) => {
                          console.error('Failed to load subcategory image:', subcategory.image_url);
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/placeholder.svg') {
                            target.src = '/placeholder.svg';
                          }
                        }}
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{subcategory.name}</h3>
                      <p className="text-sm text-gray-500">/{subcategory.slug}</p>
                      {subcategory.description && (
                        <p className="text-sm text-gray-600">{subcategory.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {subcategory.categories && (
                          <Badge variant="outline" className="text-xs">
                            {subcategory.categories.name}
                          </Badge>
                        )}
                        <Badge variant={subcategory.is_active ? "default" : "secondary"} className="text-xs">
                          {subcategory.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-gray-500">Order: {subcategory.sort_order}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(subcategory)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(subcategory.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
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

export default SubcategoryManagement;
