export default function ProductsLoading() {
  return (
    <main>
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="h-4 w-40 animate-pulse bg-cream-dark" />
      </div>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-9 w-64 animate-pulse bg-cream-dark" />
      </div>
      <div className="border-b border-cream-dark px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex gap-2">
          <div className="h-11 w-24 animate-pulse bg-cream-dark" />
          <div className="h-11 w-28 animate-pulse bg-cream-dark" />
          <div className="h-11 w-24 animate-pulse bg-cream-dark" />
        </div>
      </div>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-cream-off">
              <div className="aspect-[4/5] w-full animate-pulse bg-cream-dark" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-3/4 animate-pulse bg-cream-dark" />
                <div className="h-4 w-1/2 animate-pulse bg-cream-dark" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
