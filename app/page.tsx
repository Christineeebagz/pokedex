import { Suspense } from "react";
import ClientHome from "./client-home";

interface SearchParams {
  query?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export default function Home({
  searchParams,
}: {
  searchParams: SearchParams; // Now using the interface
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientHome
        initialQuery={searchParams.query}
        initialSort={searchParams.sort}
        initialOrder={searchParams.order}
      />
    </Suspense>
  );
}
