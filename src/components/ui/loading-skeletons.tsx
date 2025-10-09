import { Skeleton } from "@/components/ui/skeleton";

export const AppointmentCardSkeleton = () => {
  return (
    <div className="grid grid-cols-12 gap-4 items-center p-4 rounded-lg border border-gold/10 bg-card/50">
      {/* Fecha */}
      <div className="col-span-6 md:col-span-2 space-y-2">
        <Skeleton className="h-4 w-12" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      
      {/* Hora */}
      <div className="col-span-6 md:col-span-1 space-y-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-5 w-12" />
      </div>
      
      {/* Cliente */}
      <div className="col-span-12 md:col-span-3 space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-3 w-24" />
      </div>
      
      {/* Servicio */}
      <div className="col-span-6 md:col-span-2 space-y-2">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-5 w-full" />
      </div>
      
      {/* Barbero */}
      <div className="col-span-6 md:col-span-2 space-y-2">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-5 w-full" />
      </div>
      
      {/* Estado */}
      <div className="col-span-6 md:col-span-1 space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      {/* Acciones */}
      <div className="col-span-6 md:col-span-1">
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
};

export const DashboardCardSkeleton = () => {
  return (
    <div className="glass-effect border-gold/20 rounded-lg p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
};

export const CalendarSkeleton = () => {
  return (
    <div className="glass-effect border-gold/20 rounded-lg p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};