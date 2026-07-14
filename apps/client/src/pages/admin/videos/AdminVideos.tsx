import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Video, Search, Check, Play, ExternalLink
} from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import { useFetch, useMutationAction } from '@/hooks/useQuery';
import type { WebsiteSettings } from '@/types';

interface VideoItem {
  id: string;
  title: string;
  url: string;
  platform: 'youtube' | 'vimeo' | 'other';
  thumbnail: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

const createVideo = (): VideoItem => ({
  id: `video-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  title: '',
  url: '',
  platform: 'youtube',
  thumbnail: '',
  description: '',
  sortOrder: 0,
  isActive: true,
  createdAt: new Date().toISOString(),
});

export default function AdminVideos() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VideoItem | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const { data } = useFetch<WebsiteSettings>(['settings'], '/settings');
  const settings = data?.data || {};

  const updateSetting = useMutationAction<Record<string, string>, any>(
    '/settings',
    'put',
    { successMessage: 'Video berhasil disimpan', invalidateKeys: [['settings']] }
  );

  useEffect(() => {
    if (!loaded && Object.keys(settings).length > 0) {
      try {
        const raw = (settings as any).videos;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setVideos(parsed);
        }
      } catch {}
      setLoaded(true);
    }
  }, [settings, loaded]);

  const saveVideos = async (items: VideoItem[]) => {
    await updateSetting.mutateAsync({ videos: JSON.stringify(items) });
    setVideos(items);
  };

  const getEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('/')[0]?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    return url;
  };

  const getThumbnailUrl = (url: string): string | null => {
    if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0] || '';
      } else {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      }
      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    }
    if (url.includes('vimeo.com/')) {
      return null;
    }
    return null;
  };

  const openCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: VideoItem) => {
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

    const item: VideoItem = {
      id: editingItem?.id || createVideo().id,
      title: (formData.get('title') as string) || '',
      url: (formData.get('url') as string) || '',
      platform: (formData.get('platform') as 'youtube' | 'vimeo' | 'other') || 'youtube',
      thumbnail: (formData.get('thumbnail') as string) || '',
      description: (formData.get('description') as string) || '',
      sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
      isActive: formData.get('isActive') === 'on',
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    if (!item.title || !item.url) return;

    // Auto-generate thumbnail for YouTube
    if (!item.thumbnail) {
      const autoThumb = getThumbnailUrl(item.url);
      if (autoThumb) item.thumbnail = autoThumb;
    }

    let updated: VideoItem[];
    if (editingItem) {
      updated = videos.map((v) => (v.id === editingItem.id ? item : v));
    } else {
      updated = [...videos, item];
    }

    await saveVideos(updated);
    closeModal();
  };

  const handleDelete = (item: VideoItem) => {
    if (!confirm(`Hapus video "${item.title}"?`)) return;
    saveVideos(videos.filter((v) => v.id !== item.id));
  };

  const toggleActive = async (item: VideoItem) => {
    const updated = videos.map((v) =>
      v.id === item.id ? { ...v, isActive: !v.isActive } : v
    );
    await saveVideos(updated);
  };

  const filtered = videos.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.sortOrder - a.sortOrder);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Video Highlight</h1>
          <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">
            Kelola video highlight (YouTube, Vimeo) untuk ditampilkan di website
          </p>
        </div>
        <Button variant="gold" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Video
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Cari video..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada video</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((video) => (
              <div
                key={video.id}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  video.isActive
                    ? 'border-gray-200 bg-white dark:bg-dark-elevated hover:shadow-md'
                    : 'border-dashed border-gray-200 bg-gray-50 dark:bg-dark-hover'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative group aspect-video bg-gray-100">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-gray-900 ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium">
                    {video.platform.toUpperCase()}
                  </span>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => setPreviewVideo(video)}
                      className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/40 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text text-sm line-clamp-1">
                      {video.title}
                    </h3>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => toggleActive(video)}
                        className={`p-1 rounded-lg transition-colors ${
                          video.isActive
                            ? 'text-emerald-600'
                            : 'text-gray-400 hover:text-emerald-600'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEdit(video)}
                        className="p-1 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(video)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {video.description && (
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1 line-clamp-1">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      video.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {video.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      Buka <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
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
        title={editingItem ? 'Edit Video' : 'Tambah Video'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Judul Video"
              name="title"
              defaultValue={editingItem?.title || ''}
              placeholder="Wedding Highlight - Andi & Sari"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Platform</label>
              <select
                name="platform"
                defaultValue={editingItem?.platform || 'youtube'}
                className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-elevated px-4 py-2.5 text-sm"
              >
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Input
                label="URL Video"
                name="url"
                defaultValue={editingItem?.url || ''}
                placeholder="https://youtube.com/watch?v=..."
                required
              />
            </div>
            <Input
              label="Thumbnail URL (opsional)"
              name="thumbnail"
              defaultValue={editingItem?.thumbnail || ''}
              placeholder="Auto dari YouTube jika dikosongkan"
            />
            <Input
              label="Urutan"
              type="number"
              name="sortOrder"
              defaultValue={editingItem?.sortOrder || 0}
            />
          </div>
          <Textarea
            label="Deskripsi"
            name="description"
            defaultValue={editingItem?.description || ''}
            placeholder="Deskripsi video..."
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

      {/* Preview Video Modal */}
      <Modal
        isOpen={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
        title={previewVideo?.title || 'Preview Video'}
        size="xl"
      >
        {previewVideo && (
          <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
            <iframe
              src={getEmbedUrl(previewVideo.url)}
              title={previewVideo.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
