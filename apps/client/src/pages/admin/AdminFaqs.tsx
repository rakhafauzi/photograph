import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, HelpCircle, Search } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Card from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useFetchList, useMutationAction } from '@/hooks/useQuery';
import { useForm } from 'react-hook-form';
import type { Faq } from '@/types';

export default function AdminFaqs() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Faq | null>(null);

  const { data, isLoading } = useFetchList<Faq>(['admin-faqs'], '/faqs/admin');
  const faqs = data?.data || [];

  const createMutation = useMutationAction<any, Faq>(
    '/faqs',
    'post',
    { successMessage: 'FAQ berhasil dibuat', invalidateKeys: [['admin-faqs']], onSuccess: () => closeModal() }
  );

  const updateMutation = useMutationAction<any, Faq>(
    `/faqs/${editingItem?.id}`,
    'put',
    { successMessage: 'FAQ berhasil diupdate', invalidateKeys: [['admin-faqs']], onSuccess: () => closeModal() }
  );

  const deleteMutation = useMutationAction<any, void>(
    `/faqs/${editingItem?.id}`,
    'delete',
    { successMessage: 'FAQ berhasil dihapus', invalidateKeys: [['admin-faqs']] }
  );

  const form = useForm({ defaultValues: { question: '', answer: '', sortOrder: 0 } });

  const openCreate = () => {
    setEditingItem(null);
    form.reset({ question: '', answer: '', sortOrder: 0 });
    setIsModalOpen(true);
  };

  const openEdit = (item: Faq) => {
    setEditingItem(item);
    form.reset({ question: item.question, answer: item.answer, sortOrder: item.sortOrder });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingItem(null); form.reset(); };

  const handleSubmit = form.handleSubmit((data) => {
    if (editingItem) updateMutation.mutate(data);
    else createMutation.mutate(data);
  });

  const handleDelete = (item: Faq) => {
    if (confirm(`Hapus FAQ?`)) {
      setEditingItem(item);
      deleteMutation.mutate(undefined);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">FAQ</h1>
          <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">Kelola pertanyaan yang sering diajukan</p>
        </div>
        <Button variant="gold" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Tambah FAQ
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input placeholder="Cari FAQ..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="w-4 h-4" />} />
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="space-y-3">
            {faqs
              .filter((f: Faq) => f.question.toLowerCase().includes(search.toLowerCase()))
              .map((faq: Faq) => (
                <div key={faq.id} className="flex items-start justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-hover hover:bg-gray-100 dark:hover:bg-dark-hover/80 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-dark-text text-sm">{faq.question}</p>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1 line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button onClick={() => openEdit(faq)} className="p-2 rounded-lg text-gray-400 dark:text-dark-text-tertiary hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(faq)} className="p-2 rounded-lg text-gray-400 dark:text-dark-text-tertiary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            {faqs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada FAQ</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Edit FAQ' : 'Tambah FAQ'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Pertanyaan" placeholder="Apa saja paket yang tersedia?" {...form.register('question', { required: true })} />
          <Textarea label="Jawaban" placeholder="Kami menyediakan..." {...form.register('answer', { required: true })} />
          <Input label="Urutan" type="number" {...form.register('sortOrder', { valueAsNumber: true })} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={closeModal}>Batal</Button>
            <Button variant="gold" type="submit">{editingItem ? 'Update' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
