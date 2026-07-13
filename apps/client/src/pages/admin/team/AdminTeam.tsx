import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserRound, Camera, Video, Pen, Shield, Wifi,
  Plus, Pencil, Trash2, Search, CheckCircle
} from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useFetchList } from '@/hooks/useQuery';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';
import type { User } from '@/types';

const roleOptions = [
  { value: 'photographer', label: 'Photographer', icon: Camera },
  { value: 'videographer', label: 'Videographer', icon: Video },
  { value: 'editor', label: 'Editor', icon: Pen },
  { value: 'admin', label: 'Admin', icon: Shield },
  { value: 'freelance', label: 'Freelance', icon: Wifi },
];

const roleIcons: Record<string, any> = {
  photographer: Camera,
  videographer: Video,
  editor: Pen,
  admin: Shield,
  freelance: Wifi,
};

const roleColors: Record<string, string> = {
  photographer: 'bg-blue-50 text-blue-600',
  videographer: 'bg-purple-50 text-purple-600',
  editor: 'bg-cyan-50 text-cyan-600',
  admin: 'bg-gold-50 text-gold-600',
  freelance: 'bg-orange-50 text-orange-600',
};

export default function AdminTeam() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Fetch team members
  const { data: teamData, isLoading } = useFetchList<User>(
    ['admin-team'],
    '/users',
    {}
  );

  const teamMembers: (User & { role: string })[] = (teamData?.data || []).map((u: User) => ({
    ...u,
    role: u.role || 'admin',
  }));

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'photographer',
      password: '',
    },
  });

  const filtered = teamMembers.filter((member) => {
    if (search) {
      const q = search.toLowerCase();
      if (!member.name.toLowerCase().includes(q) && !member.email.toLowerCase().includes(q)) return false;
    }
    if (roleFilter && member.role !== roleFilter) return false;
    return true;
  });

  const openCreate = () => {
    setEditingItem(null);
    form.reset({ name: '', email: '', phone: '', role: 'photographer', password: '' });
    setIsModalOpen(true);
  };

  const openEdit = (member: any) => {
    setEditingItem(member);
    form.reset({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      password: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    form.reset();
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      if (editingItem) {
        await api.put(`/users/${editingItem.id}`, data);
        toast.success('Anggota tim berhasil diupdate');
      } else {
        await api.post('/users', { ...data, role: data.role });
        toast.success('Anggota tim berhasil ditambahkan');
      }
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan data');
    }
  });

  const handleDelete = async (member: any) => {
    if (!confirm(`Hapus ${member.name} dari tim?`)) return;
    try {        await api.delete(`/users/${member.id}`);
      toast.success('Anggota tim berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tim</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola photographer, videographer, editor, dan staf</p>
        </div>
        <Button variant="gold" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Anggota
        </Button>
      </div>

      {/* Role Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setRoleFilter('')}
          className={`px-4 py-2 text-sm rounded-xl font-medium transition-colors ${
            !roleFilter ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Semua
        </button>
        {roleOptions.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.value}
              onClick={() => setRoleFilter(role.value)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl font-medium transition-colors ${
                roleFilter === role.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {role.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Cari anggota tim..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <UserRound className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada anggota tim</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => {
            const RoleIcon = roleIcons[member.role] || UserRound;
            const roleColor = roleColors[member.role] || 'bg-gray-50 text-gray-600';
            const roleLabel = roleOptions.find(r => r.value === member.role)?.label || member.role;

            return (
              <Card key={member.id} hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${roleColor} flex items-center justify-center`}>
                      <RoleIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge variant="info" className="text-[10px]">
                          {roleLabel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(member)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[8px]">@</span>
                    {member.email}
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="text-xs">📞</span>
                      {member.phone}
                    </div>
                  )}
                </div>

                {/* Status Toggle */}
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Aktif
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Anggota Tim' : 'Tambah Anggota Tim'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            placeholder="Nama anggota tim"
            {...form.register('name', { required: true })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            {...form.register('email', { required: true })}
          />
          <Input
            label="No. WhatsApp"
            placeholder="6281234567890"
            {...form.register('phone')}
          />
          <Select
            label="Role"
            options={roleOptions}
            {...form.register('role')}
          />
          {!editingItem && (
            <Input
              label="Password"
              type="password"
              placeholder="Minimal 6 karakter"
              {...form.register('password', { required: !editingItem, minLength: 6 })}
            />
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={closeModal}>Batal</Button>
            <Button variant="gold" type="submit">
              {editingItem ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
