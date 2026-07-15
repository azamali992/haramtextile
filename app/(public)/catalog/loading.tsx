export default function ProductsLoading() {
  return (
    <main>
      {/* Breadcrumb */}
      <div className="px-6 pb-2 pt-6 sm:px-10">
        <div className="mx-auto max-w-[90rem]">
          <div className="h-4 w-40 animate-pulse rounded-pill bg-[var(--surface)]" />
        </div>
      </div>
      {/* Page header */}
      <div className="px-6 pb-14 pt-12 sm:px-10 sm:pt-16">
        <div className="mx-auto max-w-[90rem] space-y-5">
          <div className="h-4 w-32 animate-pulse rounded-pill bg-[var(--surface)]" />
          <div className="h-14 w-80 max-w-full animate-pulse rounded-tile bg-[var(--surface)]" />
          <div className="h-4 w-full max-w-2xl animate-pulse rounded-pill bg-[var(--surface)]" />
        </div>
      </div>
      {/* Filter pills */}
      <div className="px-6 sm:px-10">
        <div className="mx-auto flex max-w-[90rem] gap-2.5 border-t border-[var(--hairline)] py-6">
          <div className="h-11 w-28 animate-pulse rounded-pill bg-[var(--surface)]" />
          <div className="h-11 w-32 animate-pulse rounded-pill bg-[var(--surface)]" />
          <div className="h-11 w-28 animate-pulse rounded-pill bg-[var(--surface)]" />
        </div>
      </div>
      {/* Card grid */}
      <div className="px-6 py-14 sm:px-10 sm:py-16">
        <div className="mx-auto grid max-w-[90rem] grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/5] w-full animate-pulse rounded-card bg-[var(--surface)]" />
              <div className="mt-5 space-y-2.5">
                <div className="h-6 w-3/4 animate-pulse rounded-pill bg-[var(--surface)]" />
                <div className="h-4 w-1/2 animate-pulse rounded-pill bg-[var(--surface)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
