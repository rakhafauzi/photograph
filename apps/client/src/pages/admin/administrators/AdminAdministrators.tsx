import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Shield, UserPlus, Pencil, Trash2, Search, CheckCircle,
  UserCog, Activity, Key, Check
} from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useFetch, useMutationAction } from '@/hooks/useQuery';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';
import type { User } from '@/types';
import type { WebsiteSettings } from '@/types';

type TabKey = 'admins' | 'roles' | 'logs';

interface RolePermission {
  key: string;
  label: string;
  description: string;
}

const defaultPermissions: RolePermission[] = [
  { key: 'manage_bookings', label: 'Kelola Booking', description: 'Melihat, mengedit, dan menghapus booking' },
  { key: 'manage_payments', label: 'Kelola Pembayaran', description: 'Verifikasi dan tolak pembayaran' },
  { key: 'manage_packages', label: 'Kelola Paket', description: 'CRUD kategori dan paket foto' },
  { key: 'manage_portfolios', label: 'Kelola Portfolio', description: 'CRUD portfolio dan galeri' },
  { key: 'manage_testimonials', label: 'Kelola Testimoni', description: 'Setujui dan hapus testimoni' },
  { key: 'manage_users', label: 'Kelola User', description: 'CRUD customer dan anggota tim' },
  { key: 'manage_settings', label: 'Kelola Pengaturan', description: 'Ubah pengaturan website dan sistem' },
  { key: 'manage_reports', label: 'Lihat Laporan', description: 'Akses semua laporan dan analisis' },
  { key: 'manage_website', label: 'Kelola Website', description: 'Edit konten website dan CMS' },
  { key: 'manage_administrators', label: 'Kelola Admin', description: 'Tambah/edit admin, role, dan permission' },
];

interface ActivityLog {
  id: string;
  action: string;
  adminName: string;
  adminEmail: string;
  target: string;
  details: string;
  timestamp: string;
}

export default function AdminAdministrators() {
  const location = useLocation();
  const queryClient = useQueryClient();

  // Determine tab from URL
  const getTabFromPath = (): TabKey => {
    if (location.pathname.includes('/administrators/roles')) return 'roles';
    if (location.pathname.includes('/administrators/logs')) return 'logs';
    return 'admins';
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getTabFromPath());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<User | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<string, boolean>>({});
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Sync tab when URL changes
  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const { data: usersData, isLoading } = useFetch<User[]>(['admin-all-users'], '/users');
  const allUsers = usersData?.data || [];

  // Filter admin users
  const adminUsers = allUsers.filter((u: User) => u.role === 'admin');

  const { data: settingsData } = useFetch<WebsiteSettings>(['admin-settings'], '/settings');
  const settings = settingsData?.data || {};

  const updateSetting = useMutationAction<Record<string, string>, any>(
    '/settings',
    'put',
    { successMessage: 'Pengaturan berhasil disimpan', invalidateKeys: [['admin-settings']] }
  );

  // Load permissions from settings
  useEffect(() => {
    if (!loaded && Object.keys(settings).length > 0) {
      try {
        const settingsAny = settings as any;
        const stored = settingsAny.admin_permissions || settingsAny.admin_roles || '{}';
        const parsed = JSON.parse(stored);
        if (Object.keys(parsed).length > 0) {
          setRolePermissions(parsed);
        } else {
          const defaults: Record<string, boolean> = {};
          defaultPermissions.forEach((p) => { defaults[p.key] = true; });
          setRolePermissions(defaults);
        }
      } catch {
        const defaults: Record<string, boolean> = {};
        defaultPermissions.forEach((p) => { defaults[p.key] = true; });
        setRolePermissions(defaults);
      }

      try {
        const settingsAny = settings as any;
        const storedLogs = settingsAny.admin_activity_log || '[]';
        const parsedLogs = JSON.parse(storedLogs);
        if (Array.isArray(parsedLogs)) setActivityLogs(parsedLogs);
      } catch {}

      setLoaded(true);
    }
  }, [settings, loaded]);

  const form = useForm({
    defaultValues: { name: '', email: '', password: '', phone: '' },
  });

  const filteredAdmins = adminUsers.filter((u: User) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setEditingItem(null);
    form.reset({ name: '', email: '', password: '', phone: '' });
    setIsModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingItem(user);
    form.reset({ name: user.name, email: user.email, password: '', phone: user.phone || '' });
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
        const payload: any = { name: data.name, email: data.email, phone: data.phone, role: 'admin' };
        if (data.password) payload.password = data.password;
        await api.put(`/users/${editingItem.id}`, payload);
        toast.success('Admin berhasil diupdate');
      } else {
        await api.post('/users', { ...data, role: 'admin' });
        toast.success('Admin berhasil ditambahkan');
      }
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });

      const log: ActivityLog = {
        id: `log-${Date.now()}`,
        action: editingItem ? 'update' : 'create',
        adminName: 'Anda',
        adminEmail: '',
        target: data.name,
        details: editingItem ? `Mengupdate admin ${data.name}` : `Menambahkan admin baru ${data.name}`,
        timestamp: new Date().toISOString(),
      };
      const updatedLogs = [log, ...activityLogs].slice(0, 100);
      setActivityLogs(updatedLogs);
      await updateSetting.mutateAsync({ admin_activity_log: JSON.stringify(updatedLogs) });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan');
    }
  });

  const handleDelete = async (user: User) => {
    if (!confirm(`Nonaktifkan admin "${user.name}"?`)) return;
    try {
      await api.delete(`/users/${user.id}`);
      toast.success('Admin berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });

      const log: ActivityLog = {
        id: `log-${Date.now()}`,
        action: 'delete',
        adminName: 'Anda',
        adminEmail: '',
        target: user.name,
        details: `Menghapus admin ${user.name}`,
        timestamp: new Date().toISOString(),
      };
      const updatedLogs = [log, ...activityLogs].slice(0, 100);
      setActivityLogs(updatedLogs);
      await updateSetting.mutateAsync({ admin_activity_log: JSON.stringify(updatedLogs) });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus');
    }
  };

  const togglePermission = (key: string) => {
    setRolePermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const savePermissions = async () => {
    await updateSetting.mutateAsync({ admin_permissions: JSON.stringify(rolePermissions) });
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'admins', label: 'Admin', icon: <Shield className="w-4 h-4" />, count: adminUsers.length },
    { key: 'roles', label: 'Role & Permission', icon: <Key className="w-4 h-4" /> },
    { key: 'logs', label: 'Activity Log', icon: <Activity className="w-4 h-4" />, count: activityLogs.length },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Administrator</h1>
          <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">
            Kelola admin, role & permission, dan activity log
          </p>
        </div>
        {activeTab === 'admins' && (
          <Button variant="gold" onClick={openCreate}>
            <UserPlus className="w-4 h-4 mr-2" /> Tambah Admin
          </Button>
        )}
        {activeTab === 'roles' && (
          <Button variant="gold" onClick={savePermissions} isLoading={updateSetting.isPending}>
            <Check className="w-4 h-4 mr-2" /> Simpan Permission
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Admin List */}
      {activeTab === 'admins' && (
        <Card>
          <div className="mb-4">
            <Input
              placeholder="Cari admin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada admin</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Admin</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((user: User) => (
                    <tr key={user.id} className="border-b border-gray-50 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl theme-accent-gradient-br flex items-center justify-center text-white font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-dark-text">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="gold">Admin</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(user)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(user)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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
      )}

      {/* Tab: Roles & Permissions */}
      {activeTab === 'roles' && (
        <Card>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Role & Permission</h2>
            <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
              Atur hak akses untuk setiap admin. Centang permission yang ingin diberikan.
            </p>
          </div>

          <div className="space-y-3">
            {defaultPermissions.map((perm) => (
              <div
                key={perm.key}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-hover hover:bg-gray-100 dark:hover:bg-dark-hover/80 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <UserCog className="w-4 h-4 text-gray-400" />
                    <p className="font-medium text-gray-900 dark:text-dark-text text-sm">{perm.label}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-0.5 ml-6">{perm.description}</p>
                </div>
                <button
                  onClick={() => togglePermission(perm.key)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                    rolePermissions[perm.key] !== false ? 'theme-accent-gradient' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                      rolePermissions[perm.key] !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                const allTrue: Record<string, boolean> = {};
                defaultPermissions.forEach((p) => { allTrue[p.key] = true; });
                setRolePermissions(allTrue);
              }}
            >
              <Check className="w-4 h-4 mr-2" /> Select All
            </Button>
            <Button variant="gold" onClick={savePermissions} isLoading={updateSetting.isPending}>
              <Key className="w-4 h-4 mr-2" /> Simpan Permission
            </Button>
          </div>
        </Card>
      )}

      {/* Tab: Activity Log */}
      {activeTab === 'logs' && (
        <Card>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Activity Log</h2>
            <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
              Riwayat aktivitas yang dilakukan oleh admin di panel.
            </p>
          </div>

          {activityLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-dark-hover">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    log.action === 'create' ? 'bg-emerald-50 text-emerald-600' :
                    log.action === 'update' ? 'bg-blue-50 text-blue-600' :
                    log.action === 'delete' ? 'bg-red-50 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {log.action === 'create' ? <UserPlus className="w-4 h-4" /> :
                     log.action === 'update' ? <Pencil className="w-4 h-4" /> :
                     log.action === 'delete' ? <Trash2 className="w-4 h-4" /> :
                     <Activity className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{log.details}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>oleh {log.adminName}</span>
                      <span>•</span>
                      <span>{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  <Badge className={
                    log.action === 'create' ? 'bg-emerald-50 text-emerald-700' :
                    log.action === 'update' ? 'bg-blue-50 text-blue-700' :
                    log.action === 'delete' ? 'bg-red-50 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {log.action === 'create' ? 'Dibuat' :
                     log.action === 'update' ? 'Diupdate' :
                     log.action === 'delete' ? 'Dihapus' : log.action}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Admin' : 'Tambah Admin'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            placeholder="Nama admin"
            error={form.formState.errors.name?.message}
            {...form.register('name', { required: true })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="admin@example.com"
            error={form.formState.errors.email?.message}
            {...form.register('email', { required: true })}
          />
          <Input
            label="No. WhatsApp"
            placeholder="6281234567890"
            {...form.register('phone')}
          />
          <Input
            label={editingItem ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}
            type="password"
            placeholder="Minimal 6 karakter"
            {...form.register('password', {
              required: !editingItem,
              minLength: { value: 6, message: 'Minimal 6 karakter' },
            })}
          />
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
