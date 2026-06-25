import { Truck } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="relative overflow-hidden bg-primary-800 py-2.5 text-center text-sm font-medium text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/50 via-transparent to-primary-900/50" />
      <p className="relative flex items-center justify-center gap-2 px-4">
        <Truck className="h-3.5 w-3.5 shrink-0 opacity-90" />
        <span>Your Trusted Destination for Home Patient Care Essentials</span>
        <span className="hidden opacity-75 sm:inline">· Pan-India Delivery</span>
      </p>
    </div>
  );
}
