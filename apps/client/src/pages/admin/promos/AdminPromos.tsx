import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Percent, Search, Tag, Check
} from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Select from '@/components/ui/select';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import { useFetch, useMutationAction } from '@/hooks/useQuery';
import { formatPrice } from '@/lib/utils';
import type { WebsiteSettings } from '@/types';
import dayjs from 'dayjs';

interface PromoItem {
  id: string;
  code: string;
  type: 'percentage' | 'nominal';
  value: number;
  minPurchase: number;
  maxDiscount: number;
  quota: number;
  used: number;
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
}

const createPromo = (): PromoItem => ({
  id: `promo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  code: '',
  type: 'percentage',
  value: 10,
  minPurchase: 0,
  maxDiscount: 0,
  quota: 100,
  used: 0,
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
  description: '',
  isActive: true,
});

export default function AdminPromos() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PromoItem | null>(null);
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const { data } = useFetch<WebsiteSettings>(['settings'], '/settings');
  const settings = data?.data || {};

  const updateSetting = useMutationAction<Record<string, string>, any>(
    '/settings',
    'put',
    { successMessage: 'Promo berhasil disimpan', invalidateKeys: [['settings']] }
  );

  useEffect(() => {
    if (!loaded && Object.keys(settings).length > 0) {
      try {
        const raw = (settings as any).promos;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setPromos(parsed);
        }
      } catch {}
      setLoaded(true);
    }
  }, [settings, loaded]);

  const savePromos = async (items: PromoItem[]) => {
    await updateSetting.mutateAsync({ promos: JSON.stringify(items) });
    setPromos(items);
  };

  const openCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: PromoItem) => {
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

    const item: PromoItem = {
      id: editingItem?.id || createPromo().id,
      code: ((formData.get('code') as string) || '').toUpperCase(),
      type: (formData.get('type') as 'percentage' | 'nominal') || 'percentage',
      value: parseInt(formData.get('value') as string) || 0,
      minPurchase: parseInt(formData.get('minPurchase') as string) || 0,
      maxDiscount: parseInt(formData.get('maxDiscount') as string) || 0,
      quota: parseInt(formData.get('quota') as string) || 0,
      used: editingItem?.used || 0,
      startDate: (formData.get('startDate') as string) || dayjs().format('YYYY-MM-DD'),
      endDate: (formData.get('endDate') as string) || dayjs().add(30, 'day').format('YYYY-MM-DD'),
      description: (formData.get('description') as string) || '',
      isActive: formData.get('isActive') === 'on',
    };

    if (!item.code) return;

    let updated: PromoItem[];
    if (editingItem) {
      updated = promos.map((p) => (p.id === editingItem.id ? item : p));
    } else {
      updated = [...promos, item];
    }

    await savePromos(updated);
    closeModal();
  };

  const handleDelete = (item: PromoItem) => {
    if (!confirm(`Hapus promo "${item.code}"?`)) return;
    savePromos(promos.filter((p) => p.id !== item.id));
  };

  const toggleActive = async (item: PromoItem) => {
    const updated = promos.map((p) =>
      p.id === item.id ? { ...p, isActive: !p.isActive } : p
    );
    await savePromos(updated);
  };

  const filtered = promos.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const now = dayjs();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Promo</h1>
          <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">
            Kelola kode promo dan diskon untuk customer
          </p>
        </div>
        <Button variant="gold" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Promo
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Cari kode promo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Percent className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada promo</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((promo) => {
              const isExpired = dayjs(promo.endDate).isBefore(now);
              const isAlmostFull = promo.used >= promo.quota;
              const isAvailable = promo.isActive && !isExpired && !isAlmostFull;

              return (
                <div
                  key={promo.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    isAvailable
                      ? 'border-gray-200 bg-white dark:bg-dark-elevated hover:shadow-md'
                      : 'border-dashed border-gray-200 bg-gray-50 dark:bg-dark-hover'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isAvailable ? 'theme-accent-bg-soft-strong' : 'bg-gray-100'
                      }`}>
                        <Tag className={`w-5 h-5 ${isAvailable ? 'theme-accent-text' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-dark-text font-mono">{promo.code}</h3>
                        <span className="text-xs text-gray-500">
                          {promo.type === 'percentage' ? `${promo.value}%` : formatPrice(promo.value)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleActive(promo)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          promo.isActive
                            ? 'text-emerald-600 bg-emerald-50'
                            : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(promo)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(promo)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {promo.description && (
                      <p className="text-gray-500 dark:text-dark-text-secondary line-clamp-1">{promo.description}</p>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Minimum: {promo.minPurchase > 0 ? formatPrice(promo.minPurchase) : 'Tidak ada'}</span>
                      <span className="text-gray-500">
                        Kuota: <strong>{promo.used}/{promo.quota}</strong>
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Mulai: {dayjs(promo.startDate).format('DD/MM/YY')}</span>
                      <span className="text-gray-500">Sampai: {dayjs(promo.endDate).format('DD/MM/YY')}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
                    {isExpired ? (
                      <Badge variant="danger">Kedaluwarsa</Badge>
                    ) : isAlmostFull ? (
                      <Badge variant="warning">Kuota Habis</Badge>
                    ) : !promo.isActive ? (
                      <Badge variant="default">Nonaktif</Badge>
                    ) : (
                      <Badge variant="success">Aktif</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Promo' : 'Tambah Promo'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Kode Promo"
              name="code"
              defaultValue={editingItem?.code || ''}
              placeholder="WEDDING50"
              required
            />
            <Select
              label="Tipe Diskon"
              options={[
                { value: 'percentage', label: 'Persentase (%)' },
                { value: 'nominal', label: 'Nominal (Rp)' },
              ]}
              name="type"
              defaultValue={editingItem?.type || 'percentage'}
            />
            <Input
              label="Nilai Diskon"
              type="number"
              name="value"
              defaultValue={editingItem?.value || 10}
              required
            />
            <Input
              label="Min. Pembelian (Rp)"
              type="number"
              name="minPurchase"
              defaultValue={editingItem?.minPurchase || 0}
            />
            <Input
              label="Maks. Diskon (Rp) - 0 = tidak terbatas"
              type="number"
              name="maxDiscount"
              defaultValue={editingItem?.maxDiscount || 0}
            />
            <Input
              label="Kuota Pemakaian"
              type="number"
              name="quota"
              defaultValue={editingItem?.quota || 100}
              required
            />
            <Input
              label="Tanggal Mulai"
              type="date"
              name="startDate"
              defaultValue={editingItem?.startDate || dayjs().format('YYYY-MM-DD')}
            />
            <Input
              label="Tanggal Berakhir"
              type="date"
              name="endDate"
              defaultValue={editingItem?.endDate || dayjs().add(30, 'day').format('YYYY-MM-DD')}
            />
          </div>
          <Textarea
            label="Deskripsi"
            name="description"
            defaultValue={editingItem?.description || ''}
            placeholder="Deskripsi promo..."
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
