export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
          <div className="absolute inset-2 animate-spin rounded-full border-4 border-red-200 border-b-red-600 [animation-direction:reverse]" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-gray-700">
          Loading Borrands...
        </p>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-600 [animation-delay:150ms]" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
