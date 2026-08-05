/**
 * Packages Management page for admin to manage membership packages.
 * Full CRUD: Create, Read, Update, Delete packages with categories and types,
 * plus Category and Package Type management (add/delete).
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Search, Plus, Edit3, Trash2, Clock, CheckCircle, Layers,
  CalendarRange, Tag, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { usePackages, useCreatePackage, useUpdatePackage, useDeletePackage } from '@/hooks/usePackages';
import {
  useCategories, useCreateCategory, useDeleteCategory,
  usePackageTypes, useCreatePackageType, useDeletePackageType,
} from '@/hooks/useCategories';
import { formatCurrency } from '@/lib/utils';
import type { Package as PackageType } from '@/types';

/** Empty package form state used to initialise the add/edit dialog. */
const emptyForm = {
  name: '',
  description: '',
  price: '',
  duration_days: '',
  discount: '',
  benefits: '',
  available_classes: '',
  status: 'active' as 'active' | 'inactive',
  category_id: '',
  package_type_id: '',
};

export default function PackagesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // --- Package CRUD state ---
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PackageType | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  // --- Category / Package Type management state ---
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [typesOpen, setTypesOpen] = useState(false);
  const [newType, setNewType] = useState({ name: '', duration_days: '' });

  // --- Data hooks ---
  const { data: packagesData, isLoading } = usePackages({ search: searchTerm || undefined });
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const deletePackage = useDeletePackage();

  const { data: categoriesData } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const { data: typesData } = usePackageTypes();
  const createPackageType = useCreatePackageType();
  const deletePackageType = useDeletePackageType();

  const packages = packagesData?.data?.results ?? [];
  const categories = categoriesData?.data?.results ?? [];
  const packageTypes = typesData?.data?.results ?? [];

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.category_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.package_type_name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============================================================
  // Package form handlers
  // ============================================================

  /** Open the add-package dialog with an empty form. */
  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormOpen(true);
  };

  /** Open the edit dialog pre-filled with the selected package. */
  const openEdit = (pkg: PackageType) => {
    setEditing(pkg);
    setForm({
      name: pkg.name,
      description: pkg.description,
      price: String(pkg.price),
      duration_days: String(pkg.duration_days),
      discount: String(pkg.discount),
      benefits: pkg.benefits || '',
      available_classes: pkg.available_classes || '',
      status: pkg.status,
      category_id: pkg.category ? String(pkg.category) : '',
      package_type_id: pkg.package_type ? String(pkg.package_type) : '',
    });
    setFormOpen(true);
  };

  /** Create or update a package depending on whether we're editing. */
  const submitPackage = () => {
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      duration_days: Number(form.duration_days),
      discount: Number(form.discount || '0'),
      benefits: form.benefits,
      available_classes: form.available_classes,
      status: form.status,
      category: form.category_id ? Number(form.category_id) : null,
      package_type: form.package_type_id ? Number(form.package_type_id) : null,
    };
    if (editing) {
      updatePackage.mutate({ id: editing.id, data: payload }, { onSuccess: () => setFormOpen(false) });
    } else {
      createPackage.mutate(payload, { onSuccess: () => setFormOpen(false) });
    }
  };

  // ============================================================
  // Category & Package Type handlers
  // ============================================================

  /** Add a new category from the management dialog. */
  const submitCategory = () => {
    if (!newCategory.name.trim()) return;
    createCategory.mutate(newCategory, { onSuccess: () => setNewCategory({ name: '', description: '' }) });
  };

  /** Add a new package type from the management dialog. */
  const submitPackageType = () => {
    if (!newType.name.trim() || !newType.duration_days) return;
    createPackageType.mutate(
      { name: newType.name, duration_days: Number(newType.duration_days) },
      { onSuccess: () => setNewType({ name: '', duration_days: '' }) }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white">Packages Management</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">
            Create and manage membership packages
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setTypesOpen(true)}>
            <CalendarRange className="h-4 w-4 mr-2" />
            Package Types
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCategoriesOpen(true)}>
            <Layers className="h-4 w-4 mr-2" />
            Categories
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
        <Input
          placeholder="Search packages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg: PackageType, index: number) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                {pkg.discount > 0 && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="warning">-{pkg.discount}% OFF</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-0.5">
                        <Clock className="h-3.5 w-3.5" />
                        {pkg.duration_days} days
                      </CardDescription>
                    </div>
                  </div>
                  {/* Category / Package Type chips */}
                  {(pkg.category_name || pkg.package_type_name) && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {pkg.category_name && (
                        <Badge variant="secondary" className="gap-1">
                          <Tag className="h-3 w-3" /> {pkg.category_name}
                        </Badge>
                      )}
                      {pkg.package_type_name && (
                        <Badge variant="outline" className="gap-1">
                          <CalendarRange className="h-3 w-3" /> {pkg.package_type_name}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-charcoal-900 dark:text-white">
                      {formatCurrency(pkg.discounted_price)}
                    </span>
                    {pkg.discount > 0 && (
                      <span className="text-sm text-charcoal-400 line-through">
                        {formatCurrency(pkg.price)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400 line-clamp-2">
                    {pkg.description || 'No description'}
                  </p>

                  {(pkg.benefits_list || []).length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400 mb-2 uppercase tracking-wider">
                        Benefits
                      </p>
                      <ul className="space-y-1.5">
                        {(pkg.benefits_list || []).slice(0, 4).map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                        {(pkg.benefits_list || []).length > 4 && (
                          <li className="text-sm text-primary-600 dark:text-primary-400">
                            +{(pkg.benefits_list || []).length - 4} more benefits
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Badge variant={pkg.status === 'active' ? 'success' : 'secondary'}>
                      {pkg.status}
                    </Badge>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(pkg)} aria-label={`Edit ${pkg.name}`}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePackage.mutate(pkg.id)}
                        aria-label={`Delete ${pkg.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && filteredPackages.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-charcoal-300 dark:text-charcoal-600 mb-4" />
          <h3 className="text-lg font-medium text-charcoal-900 dark:text-white mb-1">No packages found</h3>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
            Create your first membership package to get started
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* Package Add / Edit Dialog */}
      {/* ============================================================ */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Package' : 'Add Package'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the membership package details below.'
                : 'Fill in the details to create a new membership package.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Elite Membership" />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description of the package" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select value={form.category_id || undefined} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Package Type</label>
              <Select value={form.package_type_id || undefined} onValueChange={(v) => setForm({ ...form, package_type_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {packageTypes.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Price</label>
              <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Duration (Days)</label>
              <Input type="number" min="1" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} placeholder="30" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Discount (%)</label>
              <Input type="number" step="0.01" min="0" max="100" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="0" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as 'active' | 'inactive' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">Benefits (one per line)</label>
              <textarea
                value={form.benefits}
                onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-charcoal-300 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none dark:border-charcoal-700 dark:text-charcoal-100"
                placeholder={'24/7 access\nFree gym towel\n...'}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">Available Classes (one per line)</label>
              <textarea
                value={form.available_classes}
                onChange={(e) => setForm({ ...form, available_classes: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-charcoal-300 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none dark:border-charcoal-700 dark:text-charcoal-100"
                placeholder={'Spin\nYoga\n...'}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={submitPackage} disabled={!form.name || !form.price || !form.duration_days}>
              {editing ? 'Save Changes' : 'Create Package'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* Category Management Dialog */}
      {/* ============================================================ */}
      <Dialog open={categoriesOpen} onOpenChange={setCategoriesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>Add or delete package categories.</DialogDescription>
          </DialogHeader>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">New Category</label>
              <Input value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} placeholder="Category name" />
            </div>
            <Button onClick={submitCategory} disabled={!newCategory.name.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          <Input value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} placeholder="Description (optional)" />

          <div className="space-y-2 mt-2 max-h-72 overflow-y-auto">
            {categories.length === 0 ? (
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400 text-center py-4">No categories yet.</p>
            ) : (
              categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-charcoal-200 dark:border-charcoal-800">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm font-medium">{c.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteCategory.mutate(c.id)} aria-label={`Delete ${c.name}`}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* Package Type Management Dialog */}
      {/* ============================================================ */}
      <Dialog open={typesOpen} onOpenChange={setTypesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Package Types</DialogTitle>
            <DialogDescription>Add or delete membership package types.</DialogDescription>
          </DialogHeader>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">New Type Name</label>
              <Input value={newType.name} onChange={(e) => setNewType({ ...newType, name: e.target.value })} placeholder="e.g. Quarterly" />
            </div>
            <div className="w-32">
              <label className="text-sm font-medium mb-1 block">Duration (Days)</label>
              <Input type="number" min="1" value={newType.duration_days} onChange={(e) => setNewType({ ...newType, duration_days: e.target.value })} placeholder="90" />
            </div>
            <Button onClick={submitPackageType} disabled={!newType.name.trim() || !newType.duration_days}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          <div className="space-y-2 mt-2 max-h-72 overflow-y-auto">
            {packageTypes.length === 0 ? (
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400 text-center py-4">No package types yet.</p>
            ) : (
              packageTypes.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-charcoal-200 dark:border-charcoal-800">
                  <div className="flex items-center gap-2">
                    <CalendarRange className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm font-medium">{t.name}</span>
                    <span className="text-xs text-charcoal-500 dark:text-charcoal-400">{t.duration_days} days</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deletePackageType.mutate(t.id)} aria-label={`Delete ${t.name}`}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}