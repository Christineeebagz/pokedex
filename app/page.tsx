// import { Suspense } from "react";
// import ClientHome from "./client-home";

// interface SearchParams {
//   query?: string;
//   sort?: string;
//   order?: "asc" | "desc";
// }

// export default function Home({
//   searchParams,
// }: {
//   searchParams: SearchParams; // Now using the interface
// }) {
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <ClientHome
//         initialQuery={searchParams.query}
//         initialSort={searchParams.sort}
//         initialOrder={searchParams.order}
//       />
//     </Suspense>
//   );
// }

import { Suspense } from "react";
import ClientHome from "./client-home";

// Optional: Define the searchParams shape
interface SearchParams {
  query?: string;
  sort?: string;
  order?: "asc" | "desc";
}

interface PageProps {
  searchParams: SearchParams;
}

export default function Home({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientHome
        initialQuery={searchParams?.query}
        initialSort={searchParams?.sort}
        initialOrder={searchParams?.order as "asc" | "desc"}
      />
    </Suspense>
  );
}

// import { useState, useEffect } from "react";
// import LoadMore from "@/components/LoadMore";
// import PokemonCard from "@/components/PokemonCard";
// import SearchForm from "@/components/SearchForm";
// import SortCriteriaSelect from "@/components/SortCriteriaSelect";
// import SortOrderToggle from "@/components/SortOrderToggle";
// import { formatIdNum } from "@/lib/utils";
// import localFont from "next/font/local";
// import { Key } from "react";

// const ketchum = localFont({
//   src: "./fonts/Ketchum.otf",
// });

// interface Pokemon {
//   id: number;
//   name: string;
//   types?: string[];
// }

// export default async function Home({
//   searchParams,
// }: {
//   searchParams: Promise<{
//     query: any;
//     qquery?: string;
//     sort?: string;
//     order?: "asc" | "desc";
//   }>;
// }) {
//   const [displayCount, setDisplayCount] = useState(10);
//   const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
//   // const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const query = (await searchParams).query?.toLowerCase();
//   const sortCriteria = (await searchParams).sort || "id";
//   const sortOrder = (await searchParams).order || "asc";

//   const fetchAllPokemonList = async () => {
//     // First get the count
//     const countRes = await fetch("https://pokeapi.co/api/v2/pokemon");
//     const countData = await countRes.json();

//     const allRes = await fetch(
//       `https://pokeapi.co/api/v2/pokemon?limit=${countData.count}`
//     );
//     const allData = await allRes.json();
//     // Then fetch all Pokémon with their details in one request

//     // Map through results and include the ID (which is in the URL)
//     return allData.results.map((p: { name: string; url: string }) => {
//       // Extract ID from URL (more efficient than individual requests)
//       const id = parseInt(p.url.split("/").filter(Boolean).pop() || "0");
//       return {
//         id,
//         name: p.name,
//         url: p.url,
//       };
//     });
//   };

//   // Fetch detailed data for Pokémon (used for initial display and cards)
//   const fetchPokemonDetails = async (id: number): Promise<Pokemon> => {
//     const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
//     const data = await res.json();
//     return {
//       id: id,
//       name: data.name,
//       types: data.types.map((t: { type: { name: string } }) => t.type.name),
//     };
//   };

//   const completeList = await fetchAllPokemonList();
//   const initialPokemonIds = Array.from({ length: 10 }, (_, i) => i + 1);
//   const initialDetailedData = await Promise.all(
//     initialPokemonIds.map((id) => fetchPokemonDetails(id))
//   );

//   let sortedCompleteList = [...completeList].sort((a, b) => {
//     return sortCriteria === "name" ? a.name.localeCompare(b.name) : a.id - b.id;
//   });

//   // Sorting function
//   const sortPokemon = (a: Pokemon, b: Pokemon) => {
//     if (sortCriteria === "name") {
//       return sortOrder === "asc"
//         ? a.name.localeCompare(b.name)
//         : b.name.localeCompare(a.name);
//     } else {
//       return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
//     }
//   };

//   let filteredPokemon = query
//     ? sortedCompleteList.filter((pokemon: { name: string; id: number }) => {
//         const searchQuery = query.toLowerCase();
//         return (
//           pokemon.name.toLowerCase().includes(searchQuery) ||
//           pokemon.id.toString() === query ||
//           pokemon.id.toString().includes(query) ||
//           formatIdNum(pokemon.id).toString() === query ||
//           formatIdNum(pokemon.id).toString().includes(searchQuery)
//         );
//       })
//     : initialDetailedData;

//   // Apply sorting
//   filteredPokemon = [...filteredPokemon].sort(sortPokemon);
//   // let filteredPokemon;
//   if (query) {
//     // When there's a query, sort only the filtered results
//     filteredPokemon = completeList
//       .filter((pokemon: { name: string; id: number }) => {
//         const searchQuery = query.toLowerCase();
//         return (
//           pokemon.name.toLowerCase().includes(searchQuery) ||
//           pokemon.id.toString() === query ||
//           formatIdNum(pokemon.id) === query
//         );
//       })
//       .sort(sortPokemon);
//   } else {
//     // When no query, sort the complete list first, then take first 10
//     const sortedCompleteList = [...completeList].sort(sortPokemon);
//     filteredPokemon = await Promise.all(
//       sortedCompleteList
//         .slice(0, 10)
//         .map((p: { id: number }) => fetchPokemonDetails(p.id))
//     );
//   }

//   // For initial load with name sort, get first 10 sorted by name
//   if (sortCriteria === "name" && !query) {
//     const first10Sorted = completeList.sort(sortPokemon).slice(0, 10);
//     filteredPokemon = await Promise.all(
//       first10Sorted.map((p: { id: number }) => fetchPokemonDetails(p.id))
//     );
//   }

//   const handleLoadMore = () => {
//     setDisplayCount((prev) => prev + 10);
//   };

//   return (
//     <main>
//       <h1
//         className={`${ketchum.className}
//         text-7xl leading-[110px] text-center
//         text-[#FFDE00]
//         left-1/2
//         [text-shadow:_5px_0_0_#3B4CCA,_-5px_0_0_#3B4CCA,_0_5px_0_#3B4CCA,_0_-5px_0_#3B4CCA]
//         p-4
//       `}
//       >
//         Pokedex
//       </h1>
//       <div className="flex  items-center justify-center p-10 mx-20  gap-5 bg-white/70 border-[5px] border-[#3B4CCA] rounded-[25px] h-fit">
//         <SearchForm query={query} />
//         <SortCriteriaSelect />
//         <SortOrderToggle />
//       </div>
//       <section className="mx-20 mb-20 items-center justify-center ">
//         <p>{query ? `Search results for "${query}"` : "All Pokemon"}</p>
//         <ul className="mt-7  grid md:grid-cols-5 sm:grid-cols-3 gap-5 items-center flex items-center justify-center  ">
//           {filteredPokemon?.length > 0 ? (
//             filteredPokemon.map((pokemon) => (
//               <PokemonCard
//                 key={`pokemon-${pokemon.id}`}
//                 hasQuery={!!query}
//                 post={pokemon}
//                 pokemonList={
//                   query
//                     ? filteredPokemon
//                     : completeList.map((p: { id: any; name: any }) => ({
//                         id: p.id,
//                         name: p.name,
//                         types: [],
//                       }))
//                 }
//               />
//             ))
//           ) : (
//             <p>No Pokemon found</p>
//           )}
//         </ul>
//         {!query && allPokemon.length > displayCount && (
//           <LoadMore onClick={handleLoadMore} disabled={isLoading} />
//         )}
//       </section>
//     </main>
//   );
// }
