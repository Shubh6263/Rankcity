import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4 shadow-sm">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>
      <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-neutral-500 max-w-md mb-6">
        The page or business you are looking for does not exist or may have been moved.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          Return Home
        </Link>
        <Link
          href="/explore"
          className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-all"
        >
          Explore Businesses
        </Link>
      </div>
    </div>
  );
}
