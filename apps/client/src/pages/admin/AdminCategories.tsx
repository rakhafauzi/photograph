import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, FolderOpen, Search } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import Textarea from '@/components/ui/textarea';
import Skeleton, { TableSkeleton } from '@/components/ui/skeleton';
import { useFetchList, useMutationAction } from '@/hooks/useQuery';
import { useForm } from 'react-hook-form';
import type { Category } from '@/types';

export default function AdminCategories() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);

  const { data, isLoading } = useFetchList<Category>(
    ['admin-categories'],
    '/categories',
    { all: 'true' }
  );

  const categories = data?.data || [];

  const createMutation = useMutationAction<any, Category>(
    '/categories',
    'post',
    { successMessage: 'Kategori berhasil dibuat', invalidateKeys: [['admin-categories']], onSuccess: () => closeModal() }
  );

  const updateMutation = useMutationAction<any, Category>(
    `/categories/${editingItem?.id}`,
    'put',
    { successMessage: 'Kategori berhasil diupdate', invalidateKeys: [['admin-categories']], onSuccess: () => closeModal() }
  );

  const deleteMutation = useMutationAction<any, void>(
    `/categories/${editingItem?.id}`,
    'delete',
    { successMessage: 'Kategori berhasil dihapus', invalidateKeys: [['admin-categories']] }
  );

  const form = useForm({
    defaultValues: { name: '', description: '', sortOrder: 0 },
  });

  const openCreate = () => {
    setEditingItem(null);
    form.reset({ name: '', description: '', sortOrder: 0 });
    setIsModalOpen(true);
  };

  const openEdit = (item: Category) => {
    setEditingItem(item);
    form.reset({ name: item.name, description: item.description || '', sortOrder: item.sortOrder });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    form.reset();
  };

  const handleSubmit = form.handleSubmit((data) => {
    if (editingItem) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  });

  const handleDelete = (item: Category) => {
    if (confirm(`Hapus kategori "${item.name}"?`)) {
      setEditingItem(item);
      deleteMutation.mutate(undefined);
    }
  };

  const filtered = categories.filter((c: Category) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Kategori Paket</h1>
          <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">Kelola kategori paket foto</p>
        </div>
        <Button variant="gold" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Kategori
        </Button>
      </div>

      <Card>
        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada kategori</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Nama</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Deskripsi</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Paket</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Urutan</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat: Category) => (
                  <tr key={cat.id} className="border-b border-gray-50 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg theme-accent-bg-soft-strong flex items-center justify-center">
                          <FolderOpen className="w-4 h-4 theme-accent-text" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-dark-text">{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-dark-text-secondary">{cat.description || '-'}</td>
                    <td className="py-3 px-4 text-center text-sm text-gray-500 dark:text-dark-text-secondary">{cat._count?.packages || 0}</td>
                    <td className="py-3 px-4 text-center text-sm text-gray-500 dark:text-dark-text-secondary">{cat.sortOrder}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(cat)} className="p-2 rounded-lg text-gray-400 dark:text-dark-text-tertiary hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cat)} className="p-2 rounded-lg text-gray-400 dark:text-dark-text-tertiary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Kategori' : 'Tambah Kategori'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Kategori"
            placeholder="Contoh: Wedding"
            error={form.formState.errors.name?.message}
            {...form.register('name', { required: true })}
          />
          <Textarea
            label="Deskripsi"
            placeholder="Deskripsi kategori"
            {...form.register('description')}
          />
          <Input
            label="Urutan"
            type="number"
            {...form.register('sortOrder', { valueAsNumber: true })}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={closeModal}>Batal</Button>
            <Button variant="gold" type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingItem ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
