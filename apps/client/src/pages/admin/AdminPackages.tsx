import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Select from '@/components/ui/select';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useFetchList, useFetch, useMutationAction } from '@/hooks/useQuery';
import { useForm } from 'react-hook-form';
import { formatPrice } from '@/lib/utils';
import type { Category, Package as PackageType } from '@/types';

export default function AdminPackages() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PackageType | null>(null);

  const { data: categoriesData } = useFetch<Category[]>(['categories-all'], '/categories?all=true');
  const categories = categoriesData?.data || [];

  const { data: packagesData, isLoading } = useFetchList<PackageType>(
    ['admin-packages'],
    '/packages',
    { all: 'true' }
  );

  const packages = packagesData?.data || [];

  const createMutation = useMutationAction<any, PackageType>(
    '/packages',
    'post',
    { successMessage: 'Paket berhasil dibuat', invalidateKeys: [['admin-packages']], onSuccess: () => closeModal() }
  );

  const updateMutation = useMutationAction<any, PackageType>(
    `/packages/${editingItem?.id}`,
    'put',
    { successMessage: 'Paket berhasil diupdate', invalidateKeys: [['admin-packages']], onSuccess: () => closeModal() }
  );

  const deleteMutation = useMutationAction<any, void>(
    `/packages/${editingItem?.id}`,
    'delete',
    { successMessage: 'Paket berhasil dihapus', invalidateKeys: [['admin-packages']] }
  );

  const form = useForm({
    defaultValues: {
      categoryId: '', name: '', price: 0, description: '', duration: '',
      photographer: 1, videographer: 0, photoCount: 0, videoCount: 0,
      hasDrone: false, hasAlbum: false, hasPrint: false, hasFrame: false,
      hasCinematic: false, hasHighlight: false, isPopular: false,
      location: '', benefits: '',
    },
  });

  const openCreate = () => {
    setEditingItem(null);
    form.reset({
      categoryId: categories[0]?.id || '',
      name: '', price: 0, description: '', duration: '', photographer: 1,
      videographer: 0, photoCount: 0, videoCount: 0, hasDrone: false,
      hasAlbum: false, hasPrint: false, hasFrame: false, hasCinematic: false,
      hasHighlight: false, isPopular: false, location: '', benefits: '',
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: PackageType) => {
    setEditingItem(item);
    form.reset({
      categoryId: item.categoryId,
      name: item.name,
      price: item.price,
      description: item.description || '',
      duration: item.duration || '',
      photographer: item.photographer || 1,
      videographer: item.videographer || 0,
      photoCount: item.photoCount || 0,
      videoCount: item.videoCount || 0,
      hasDrone: item.hasDrone,
      hasAlbum: item.hasAlbum,
      hasPrint: item.hasPrint,
      hasFrame: item.hasFrame,
      hasCinematic: item.hasCinematic,
      hasHighlight: item.hasHighlight,
      isPopular: item.isPopular,
      location: item.location || '',
      benefits: item.benefits?.map(b => b.benefit).join('\n') || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    form.reset();
  };

  const handleSubmit = form.handleSubmit((data) => {
    const payload = {
      ...data,
      benefits: data.benefits.split('\n').filter(Boolean),
    };

    if (editingItem) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  });

  const handleDelete = (item: PackageType) => {
    if (confirm(`Hapus paket "${item.name}"?`)) {
      setEditingItem(item);
      deleteMutation.mutate(undefined);
    }
  };

  const filtered = packages.filter((p: PackageType) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Paket Foto</h1>
          <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">Kelola paket foto</p>
        </div>
        <Button variant="gold" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Paket
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Cari paket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada paket</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Nama</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Kategori</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Harga</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pkg: PackageType) => (
                  <tr key={pkg.id} className="border-b border-gray-50 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-dark-text">{pkg.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-dark-text-secondary">{pkg.category?.name || '-'}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-dark-text">{formatPrice(pkg.price)}</td>
                    <td className="py-3 px-4 text-center">
                      {pkg.isPopular && <Badge variant="gold">Popular</Badge>}
                      {!pkg.isPopular && <span className="text-xs text-gray-400 dark:text-dark-text-tertiary">-</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(pkg)} className="p-2 rounded-lg text-gray-400 dark:text-dark-text-tertiary hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(pkg)} className="p-2 rounded-lg text-gray-400 dark:text-dark-text-tertiary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
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

      {/* Package Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Paket' : 'Tambah Paket'}
        size="full"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Kategori"
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              {...form.register('categoryId')}
            />
            <Input label="Nama Paket" placeholder="Basic" {...form.register('name', { required: true })} />
            <Input label="Harga" type="number" {...form.register('price', { valueAsNumber: true })} />
            <Input label="Durasi" placeholder="8 Jam" {...form.register('duration')} />
            <Input label="Jumlah Fotografer" type="number" {...form.register('photographer', { valueAsNumber: true })} />
            <Input label="Jumlah Videografer" type="number" {...form.register('videographer', { valueAsNumber: true })} />
            <Input label="Jumlah Foto" type="number" {...form.register('photoCount', { valueAsNumber: true })} />
            <Input label="Jumlah Video" type="number" {...form.register('videoCount', { valueAsNumber: true })} />
            <Input label="Lokasi" placeholder="Cakupan area" {...form.register('location')} />
          </div>

          <Textarea label="Deskripsi" placeholder="Deskripsi paket..." {...form.register('description')} />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'hasDrone', label: 'Drone' },
              { key: 'hasAlbum', label: 'Album' },
              { key: 'hasPrint', label: 'Cetak Foto' },
              { key: 'hasFrame', label: 'Frame' },
              { key: 'hasCinematic', label: 'Video Cinematic' },
              { key: 'hasHighlight', label: 'Video Highlight' },
              { key: 'isPopular', label: 'Paket Popular' },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input type="checkbox" {...form.register(item.key as any)} className="rounded theme-accent-text focus:ring-[var(--theme-accent-400)]" />
                <span className="text-sm text-gray-700 dark:text-dark-text">{item.label}</span>
              </label>
            ))}
          </div>

          <Textarea label="Benefit (satu per baris)" placeholder="Foto HD Unlimited&#10;Album Premium&#10;Edit Professional" {...form.register('benefits')} />

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
