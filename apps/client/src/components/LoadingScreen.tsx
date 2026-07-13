import { Camera } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <div className="relative inline-flex">
          <Camera className="w-12 h-12 theme-accent-text animate-bounce" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 theme-accent-bg-soft-strong rounded-full animate-pulse" />
        </div>
        <p className="mt-4 text-sm text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}
