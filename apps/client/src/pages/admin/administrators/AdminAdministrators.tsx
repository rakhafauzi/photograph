import PlaceholderPage from '@/components/PlaceholderPage';
import { Shield } from 'lucide-react';

export default function AdminAdministrators() {
  return (
    <PlaceholderPage
      title="Administrator"
      description="Kelola admin, role, permission, dan activity log"
      icon={<Shield className="w-10 h-10 text-gold-500" />}
    />
  );
}
