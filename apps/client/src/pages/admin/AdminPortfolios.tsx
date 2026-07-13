import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Image, Search, Eye } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Select from '@/components/ui/select';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import FileUpload from '@/components/ui/FileUpload';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useFetchList, useFetch, useMutationAction } from '@/hooks/useQuery';
import { useForm } from 'react-hook-form';
import type { Portfolio, Category } from '@/types';

export default function AdminPortfolios() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Portfolio | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Portfolio | null>(null);

  const { data: categoriesData } = useFetch<Category[]>(['categories-all'], '/categories?all=true');
  const categories = categoriesData?.data || [];

  const { data, isLoading } = useFetchList<Portfolio>(
    ['admin-portfolios'],
    '/portfolios'
  );
  const portfolios = data?.data || [];

  const createMutation = useMutationAction<any, Portfolio>(
    '/portfolios',
    'post',
    { successMessage: 'Portfolio berhasil dibuat', invalidateKeys: [['admin-portfolios']], onSuccess: () => closeModal() }
  );

  const updateMutation = useMutationAction<any, Portfolio>(
    `/portfolios/${editingItem?.id}`,
    'put',
    { successMessage: 'Portfolio berhasil diupdate', invalidateKeys: [['admin-portfolios']], onSuccess: () => closeModal() }
  );

  const deleteMutation = useMutationAction<any, void>(
    `/portfolios/${editingItem?.id}`,
    'delete',
    { successMessage: 'Portfolio berhasil dihapus', invalidateKeys: [['admin-portfolios']] }
  );

  const form = useForm({
    defaultValues: { categoryId: '', title: '', description: '', coverImage: '' },
  });

  const openCreate = () => {
    setEditingItem(null);
    form.reset({ categoryId: categories[0]?.id || '', title: '', description: '', coverImage: '' });
    setIsModalOpen(true);
  };

  const openEdit = (item: Portfolio) => {
    setEditingItem(item);
    form.reset({
      categoryId: item.categoryId || categories[0]?.id || '',
      title: item.title,
      description: item.description || '',
      coverImage: item.coverImage,
    });
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

  const handleDelete = (item: Portfolio) => {
    if (confirm(`Hapus portfolio "${item.title}"?`)) {
      setEditingItem(item);
      deleteMutation.mutate(undefined);
    }
  };

  const handleViewDetail = (item: Portfolio) => {
    setDetailItem(item);
    setIsDetailOpen(true);
  };

  const filtered = portfolios.filter((p: Portfolio) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola galeri portfolio</p>
        </div>
        <Button variant="gold" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Portfolio
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Cari portfolio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada portfolio</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((portfolio: Portfolio) => (
              <div key={portfolio.id} className="group relative rounded-xl overflow-hidden bg-gray-100">
                {portfolio.coverImage ? (
                  <img
                    src={portfolio.coverImage}
                    alt={portfolio.title}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="aspect-square flex items-center justify-center">
                    <Image className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-semibold text-sm truncate">{portfolio.title}</p>
                    <p className="text-white/80 text-xs">{portfolio.category?.name}</p>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button
                      onClick={() => handleViewDetail(portfolio)}
                      className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/40 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(portfolio)}
                      className="p-1.5 rounded-lg bg-blue-500/50 text-white hover:bg-blue-500/70 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(portfolio)}
                      className="p-1.5 rounded-lg bg-red-500/50 text-white hover:bg-red-500/70 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Badge images count */}
                {portfolio._count && portfolio._count.images > 0 && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-medium">
                    {portfolio._count.images} foto
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Portfolio' : 'Tambah Portfolio'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUpload
            folder="portfolio"
            currentImage={form.watch('coverImage')}
            onUpload={(url) => form.setValue('coverImage', url)}
          />

          <Select
            label="Kategori"
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            {...form.register('categoryId')}
          />
          <Input
            label="Judul"
            placeholder="Judul portfolio"
            error={form.formState.errors.title?.message}
            {...form.register('title', { required: 'Judul wajib diisi' })}
          />
          <Textarea
            label="Deskripsi"
            placeholder="Deskripsi portfolio..."
            {...form.register('description')}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={closeModal}>Batal</Button>
            <Button
              variant="gold"
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingItem ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal — Enhanced with lightbox-style preview */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailItem?.title || 'Detail Portfolio'}
        size="xl"
      >
        {detailItem && (
          <div className="space-y-5">
            {/* Cover image with lightbox-style treatment */}
            {detailItem.coverImage ? (
              <div className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <div className="relative overflow-hidden">
                  <img
                    src={detailItem.coverImage}
                    alt={detailItem.title}
                    className="w-full max-h-[400px] object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  {/* Gradient overlay with action */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-3 right-3">
                      <a
                        href={detailItem.coverImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-white transition-colors"
                      >
                        <Search className="w-3.5 h-3.5" />
                        Lihat penuh
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl bg-gray-50 border border-dashed border-gray-200">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Image className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm font-medium">Belum ada cover image</p>
              </div>
            )}

            {/* Detail info — modern card grid */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Informasi Portfolio</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Kategori</p>
                  <p className="mt-1 font-semibold text-gray-900">{detailItem.category?.name || '-'}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Slug</p>
                  <p className="mt-1 font-mono font-semibold text-gray-900">{detailItem.slug}</p>
                </div>
                <div className="col-span-2 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Deskripsi</p>
                  <p className="mt-1 text-sm text-gray-900 leading-relaxed">{detailItem.description || '-'}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Jumlah Foto</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">{detailItem._count?.images || 0}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Dibuat</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {new Date(detailItem.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
              <Button variant="secondary" type="button" onClick={() => setIsDetailOpen(false)}>
                Tutup
              </Button>
              <Button
                variant="gold"
                onClick={() => {
                  setIsDetailOpen(false);
                  openEdit(detailItem);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
