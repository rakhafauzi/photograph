import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Pencil, Trash2, PackagePlus, Search, Check
} from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { useFetch, useMutationAction } from '@/hooks/useQuery';
import { formatPrice } from '@/lib/utils';
import type { WebsiteSettings } from '@/types';
import { toast } from 'sonner';

interface AddonItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  isActive: boolean;
}

const createAddon = (): AddonItem => ({
  id: `addon-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: '',
  price: 0,
  description: '',
  category: 'album',
  isActive: true,
});

const categoryOptions = [
  { value: 'album', label: 'Album' },
  { value: 'cetak', label: 'Cetak Foto' },
  { value: 'frame', label: 'Frame' },
  { value: 'video', label: 'Video' },
  { value: 'drone', label: 'Drone' },
  { value: 'other', label: 'Lainnya' },
];

const categoryLabels: Record<string, string> = {
  album: 'Album',
  cetak: 'Cetak Foto',
  frame: 'Frame',
  video: 'Video',
  drone: 'Drone',
  other: 'Lainnya',
};

export default function AdminAddons() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AddonItem | null>(null);
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const { data } = useFetch<WebsiteSettings>(['settings'], '/settings');
  const settings = data?.data || {};

  const updateSetting = useMutationAction<Record<string, string>, any>(
    '/settings',
    'put',
    { successMessage: 'Add-on berhasil disimpan', invalidateKeys: [['settings']] }
  );

  useEffect(() => {
    if (!loaded && Object.keys(settings).length > 0) {
      try {
        const raw = (settings as any).addons;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setAddons(parsed);
        }
      } catch {}
      setLoaded(true);
    }
  }, [settings, loaded]);

  const saveAddons = async (items: AddonItem[]) => {
    await updateSetting.mutateAsync({ addons: JSON.stringify(items) });
    setAddons(items);
  };

  const openCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: AddonItem) => {
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

    const item: AddonItem = {
      id: editingItem?.id || createAddon().id,
      name: (formData.get('name') as string) || '',
      price: parseInt(formData.get('price') as string) || 0,
      description: (formData.get('description') as string) || '',
      category: (formData.get('category') as string) || 'other',
      isActive: formData.get('isActive') === 'on',
    };

    if (!item.name) {
      toast.error('Nama add-on wajib diisi');
      return;
    }

    let updated: AddonItem[];
    if (editingItem) {
      updated = addons.map((a) => (a.id === editingItem.id ? item : a));
    } else {
      updated = [...addons, item];
    }

    await saveAddons(updated);
    closeModal();
  };

  const handleDelete = (item: AddonItem) => {
    if (!confirm(`Hapus add-on "${item.name}"?`)) return;
    saveAddons(addons.filter((a) => a.id !== item.id));
  };

  const toggleActive = async (item: AddonItem) => {
    const updated = addons.map((a) =>
      a.id === item.id ? { ...a, isActive: !a.isActive } : a
    );
    await saveAddons(updated);
  };

  const filtered = addons.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Add-on</h1>
          <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">
            Kelola layanan tambahan (album, cetak, frame, dll) yang bisa dipilih customer
          </p>
        </div>
        <Button variant="gold" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Add-on
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Cari add-on..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <PackagePlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada add-on. Tambahkan layanan tambahan untuk paket fotografi.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-5 transition-all ${
                  item.isActive
                    ? 'border-gray-200 bg-white dark:bg-dark-elevated hover:shadow-md'
                    : 'border-dashed border-gray-200 bg-gray-50 dark:bg-dark-hover'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                      {categoryLabels[item.category] || item.category}
                    </span>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text mt-1">{item.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleActive(item)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.isActive
                          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
                          : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary line-clamp-2">{item.description}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-gradient-gold">{formatPrice(item.price)}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    item.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {item.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Add-on' : 'Tambah Add-on'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Add-on"
            name="name"
            defaultValue={editingItem?.name || ''}
            placeholder="Contoh: Album Premium"
            required
          />
          <Input
            label="Harga"
            type="number"
            name="price"
            defaultValue={editingItem?.price || 0}
            placeholder="500000"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Kategori</label>
            <select
              name="category"
              defaultValue={editingItem?.category || 'album'}
              className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-elevated px-4 py-2.5 text-sm text-gray-900 dark:text-dark-text"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <Textarea
            label="Deskripsi"
            name="description"
            defaultValue={editingItem?.description || ''}
            placeholder="Deskripsi layanan tambahan..."
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={editingItem?.isActive ?? true}
              className="rounded theme-accent-text focus:ring-[var(--theme-accent-400)]"
            />
            <span className="text-sm text-gray-700 dark:text-dark-text">Aktif</span>
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={closeModal}>Batal</Button>
            <Button variant="gold" type="submit" isLoading={updateSetting.isPending}>
              {editingItem ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
