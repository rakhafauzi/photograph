import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, Image, Search, Eye, Grid3X3, LayoutGrid
} from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import FileUpload from '@/components/ui/FileUpload';
import { useFetch, useMutationAction } from '@/hooks/useQuery';
import type { WebsiteSettings } from '@/types';

interface GalleryItem {
  id: string;
  image: string;
  caption: string;
  category: string;
  sortOrder: number;
  createdAt: string;
}

export default function AdminGallery() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data } = useFetch<WebsiteSettings>(['settings'], '/settings');
  const settings = data?.data || {};

  const updateSetting = useMutationAction<Record<string, string>, any>(
    '/settings',
    'put',
    { successMessage: 'Galeri berhasil disimpan', invalidateKeys: [['settings']] }
  );

  useEffect(() => {
    if (!loaded && Object.keys(settings).length > 0) {
      try {
        const raw = (settings as any).gallery;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setGallery(parsed);
        }
      } catch {}
      setLoaded(true);
    }
  }, [settings, loaded]);

  const saveGallery = async (items: GalleryItem[]) => {
    await updateSetting.mutateAsync({ gallery: JSON.stringify(items) });
    setGallery(items);
  };

  const openAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const imageUrl = (formData.get('imageUrl') as string) || editingItem?.image || '';
    if (!imageUrl) {
      return;
    }

    const item: GalleryItem = {
      id: editingItem?.id || `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      image: imageUrl,
      caption: (formData.get('caption') as string) || '',
      category: (formData.get('category') as string) || 'general',
      sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    let updated: GalleryItem[];
    if (editingItem) {
      updated = gallery.map((g) => (g.id === editingItem.id ? item : g));
    } else {
      updated = [...gallery, item];
    }

    await saveGallery(updated);
    closeModal();
  };

  const handleDelete = (item: GalleryItem) => {
    if (!confirm(`Hapus foto ini?`)) return;
    saveGallery(gallery.filter((g) => g.id !== item.id));
  };

  const filtered = gallery.filter((g) =>
    g.caption.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.sortOrder - a.sortOrder);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Galeri Foto</h1>
          <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">
            Koleksi foto yang bisa ditampilkan di website
          </p>
        </div>
        <Button variant="gold" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Foto
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Cari foto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-gray-100">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada foto di galeri</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <div key={item.id} className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-square">
                <img
                  src={item.image}
                  alt={item.caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-sm font-medium truncate">{item.caption || 'Foto'}</p>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => setPreviewImage(item.image)}
                      className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/40 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg bg-blue-500/50 text-white hover:bg-blue-500/70 transition-colors"
                    >
                      <Image className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-lg bg-red-500/50 text-white hover:bg-red-500/70 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                  <img src={item.image} alt={item.caption} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.caption || 'Tanpa caption'}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setPreviewImage(item.image)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                    <Image className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Foto' : 'Tambah Foto'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="imageUrl" value={editingItem?.image || ''} />
          <FileUpload
            folder="general"
            currentImage={editingItem?.image || ''}
            onUpload={(url) => {
              // Store uploaded URL in a hidden field or state
              const input = document.querySelector<HTMLInputElement>('input[name="imageUrl"]');
              if (input) input.value = url;
            }}
          />
          <Input
            label="Caption"
            name="caption"
            defaultValue={editingItem?.caption || ''}
            placeholder="Caption foto..."
          />
          <Input
            label="Kategori"
            name="category"
            defaultValue={editingItem?.category || 'general'}
            placeholder="general, wedding, event, dll"
          />
          <Input
            label="Urutan"
            type="number"
            name="sortOrder"
            defaultValue={editingItem?.sortOrder || 0}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={closeModal}>Batal</Button>
            <Button variant="gold" type="submit" isLoading={updateSetting.isPending}>
              {editingItem ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        title="Preview Foto"
        size="xl"
      >
        {previewImage && (
          <div className="flex justify-center">
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[70vh] rounded-xl object-contain" />
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
