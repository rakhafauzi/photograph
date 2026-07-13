import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Phone, Mail, MapPin, Globe, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useFetch, useMutationAction } from '@/hooks/useQuery';
import { useForm } from 'react-hook-form';
import type { Contact } from '@/types';

const contactTypes = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'email', label: 'Email' },
  { value: 'google_maps', label: 'Google Maps' },
];

const typeIcons: Record<string, any> = {
  whatsapp: MessageSquare,
  instagram: Globe,
  facebook: Globe,
  tiktok: Globe,
  email: Mail,
  google_maps: MapPin,
};

export default function AdminContacts() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Contact | null>(null);

  const { data, isLoading } = useFetch<Contact[]>(['admin-contacts'], '/contacts');
  const contacts = data?.data || [];

  const createMutation = useMutationAction<any, Contact>(
    '/contacts',
    'post',
    { successMessage: 'Kontak berhasil ditambahkan', invalidateKeys: [['admin-contacts']], onSuccess: () => closeModal() }
  );

  const updateMutation = useMutationAction<any, Contact>(
    `/contacts/${editingItem?.id}`,
    'put',
    { successMessage: 'Kontak berhasil diupdate', invalidateKeys: [['admin-contacts']], onSuccess: () => closeModal() }
  );

  const deleteMutation = useMutationAction<any, void>(
    `/contacts/${editingItem?.id}`,
    'delete',
    { successMessage: 'Kontak berhasil dihapus', invalidateKeys: [['admin-contacts']] }
  );

  const form = useForm({ defaultValues: { type: 'whatsapp', label: '', value: '', isActive: true } });

  const openCreate = () => {
    setEditingItem(null);
    form.reset({ type: 'whatsapp', label: '', value: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEdit = (item: Contact) => {
    setEditingItem(item);
    form.reset({ type: item.type, label: item.label, value: item.value, isActive: item.isActive });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingItem(null); form.reset(); };

  const handleSubmit = form.handleSubmit((data) => {
    if (editingItem) updateMutation.mutate(data);
    else createMutation.mutate(data);
  });

  const handleDelete = (item: Contact) => {
    if (confirm('Hapus kontak ini?')) {
      setEditingItem(item);
      deleteMutation.mutate(undefined);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Kontak</h1>
          <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">Kelola kontak website</p>
        </div>
        <Button variant="gold" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Kontak
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {contacts.map((contact: Contact) => {
            const Icon = typeIcons[contact.type] || Phone;
            return (
              <Card key={contact.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${contact.isActive ? 'theme-accent-bg-soft-strong theme-accent-text' : 'bg-gray-100 dark:bg-dark-hover text-gray-400 dark:text-dark-text-tertiary'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-dark-text">{contact.label}</p>
                      <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{contact.value}</p>
                      <span className="text-xs text-gray-400 dark:text-dark-text-tertiary">{contactTypes.find(t => t.value === contact.type)?.label}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(contact)} className="p-2 rounded-lg text-gray-400 dark:text-dark-text-tertiary hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(contact)} className="p-2 rounded-lg text-gray-400 dark:text-dark-text-tertiary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
          {contacts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-dark-text-secondary">Belum ada kontak</div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Edit Kontak' : 'Tambah Kontak'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Tipe" options={contactTypes} {...form.register('type')} />
          <Input label="Label" placeholder="WhatsApp Admin" {...form.register('label', { required: true })} />
          <Input label="Value" placeholder="6281234567890" {...form.register('value', { required: true })} />
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register('isActive')} className="rounded theme-accent-text focus:ring-[var(--theme-accent-400)]" />
            <span className="text-sm text-gray-700">Aktif</span>
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={closeModal}>Batal</Button>
            <Button variant="gold" type="submit">{editingItem ? 'Update' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
