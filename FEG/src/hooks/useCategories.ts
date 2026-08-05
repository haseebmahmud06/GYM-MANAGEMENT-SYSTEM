/**
 * Hook for fetching and managing package Categories and Package Types
 * with TanStack Query. Used by the public "Categories" and "Package Types"
 * pages as well as the admin package management screens.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { packagesApi } from '@/lib/api';
import type { Category, PackageType } from '@/types';
import toast from 'react-hot-toast';

// ============================================================
// Categories
// ============================================================

/** Fetch the list of package categories for the public page. */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => packagesApi.getCategories(),
  });
}

/** Create a new category (admin). */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Category>) => packagesApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
    },
    onError: () => toast.error('Failed to create category'),
  });
}

/** Update an existing category (admin). */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) =>
      packagesApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
    },
    onError: () => toast.error('Failed to update category'),
  });
}

/** Delete a category (admin). */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => packagesApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: () => toast.error('Failed to delete category'),
  });
}

// ============================================================
// Package Types
// ============================================================

/** Fetch the list of package types for the public page. */
export function usePackageTypes() {
  return useQuery({
    queryKey: ['packageTypes'],
    queryFn: () => packagesApi.getPackageTypes(),
  });
}

/** Create a new package type (admin). */
export function useCreatePackageType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PackageType>) => packagesApi.createPackageType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packageTypes'] });
      toast.success('Package type created successfully');
    },
    onError: () => toast.error('Failed to create package type'),
  });
}

/** Update an existing package type (admin). */
export function useUpdatePackageType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PackageType> }) =>
      packagesApi.updatePackageType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packageTypes'] });
      toast.success('Package type updated successfully');
    },
    onError: () => toast.error('Failed to update package type'),
  });
}

/** Delete a package type (admin). */
export function useDeletePackageType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => packagesApi.deletePackageType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packageTypes'] });
      toast.success('Package type deleted successfully');
    },
    onError: () => toast.error('Failed to delete package type'),
  });
}
