export default function FeaturedProductsSkeleton() {
  return (
    <section className="bg-gray-50/80 py-16 sm:py-20" aria-busy="true" aria-label="Loading products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-8 w-56 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="hidden sm:block h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="card overflow-hidden animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
              aria-hidden="true"
            >
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2.5">
                <div className="h-2.5 w-14 bg-gray-200 rounded-full" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-2/3 bg-gray-200 rounded" />
                <div className="flex items-center justify-between mt-3">
                  <div className="h-5 w-20 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="h-9 bg-gray-200 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
