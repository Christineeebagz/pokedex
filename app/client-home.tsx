"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import LoadMore from "@/components/LoadMore";
import PokemonCard from "@/components/PokemonCard";
import SearchForm from "@/components/SearchForm";
import SortCriteriaSelect from "@/components/SortCriteriaSelect";
import SortOrderToggle from "@/components/SortOrderToggle";
import { formatIdNum } from "@/lib/utils";
import localFont from "next/font/local";

const ketchum = localFont({
  src: "./fonts/Ketchum.otf",
});

interface Pokemon {
  id: number;
  name: string;
  types?: string[];
}

export default function ClientHome() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("query") || "";
  const initialSort = searchParams.get("sort") || "id";
  const initialOrder = searchParams.get("order") || "asc";

  const [displayCount, setDisplayCount] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [completeList, setCompleteList] = useState<
    { id: number; name: string }[]
  >([]);
  const [displayedPokemon, setDisplayedPokemon] = useState<Pokemon[]>([]);

  const [query, setQuery] = useState(initialQuery);
  const [sortCriteria, setSortCriteria] = useState(initialSort);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    initialOrder as "asc" | "desc"
  );

  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (sortCriteria !== "id") params.set("sort", sortCriteria);
    if (sortOrder !== "asc") params.set("order", sortOrder);
    router.replace(`${pathname}?${params.toString()}`);
  }, [query, sortCriteria, sortOrder, router, pathname]);

  const fetchPokemonDetails = async (id: number): Promise<Pokemon> => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    return {
      id: id,
      name: data.name,
      types: data.types.map((t: { type: { name: string } }) => t.type.name),
    };
  };

  useEffect(() => {
    updateUrlParams();
  }, [query, sortCriteria, sortOrder, updateUrlParams]);

  // Fetch complete list of Pokémon (names/IDs only)
  useEffect(() => {
    const fetchCompleteList = async () => {
      setIsLoading(true);
      try {
        const countRes = await fetch("https://pokeapi.co/api/v2/pokemon");
        const countData = await countRes.json();
        const allRes = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=${countData.count}`
        );
        const allData = await allRes.json();

        const list = allData.results.map(
          (p: { name: string; url: string }) => ({
            id: parseInt(p.url.split("/").filter(Boolean).pop() || "0"),
            name: p.name,
          })
        );

        setCompleteList(list);
      } catch (error) {
        console.error("Failed to fetch Pokémon list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompleteList();
  }, []);

  // Filter, sort and fetch details for displayed Pokémon
  useEffect(() => {
    const updateDisplayedPokemon = async () => {
      if (completeList.length === 0) return;

      setIsLoading(true);
      try {
        // Filter based on query
        let filtered = query
          ? completeList.filter(
              (pokemon) =>
                pokemon.name.toLowerCase().includes(query.toLowerCase()) ||
                pokemon.id.toString() === query ||
                formatIdNum(pokemon.id) === query ||
                formatIdNum(pokemon.id).includes(query)
            )
          : completeList;

        // Sort the filtered list
        filtered = [...filtered].sort((a, b) => {
          if (sortCriteria === "name") {
            return sortOrder === "asc"
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          }
          return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
        });

        // Slice based on display count (only when not searching)
        const toDisplay = query ? filtered : filtered.slice(0, displayCount);

        // Fetch details for the Pokémon to display
        const detailed = await Promise.all(
          toDisplay.map((p) => fetchPokemonDetails(p.id))
        );

        setDisplayedPokemon(detailed);
      } catch (error) {
        console.error("Failed to update displayed Pokémon:", error);
      } finally {
        setIsLoading(false);
      }
    };

    updateDisplayedPokemon();
  }, [completeList, query, sortCriteria, sortOrder, displayCount]);

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 10);
  };

  return (
    <main>
      <h1
        className={`${ketchum.className} text-7xl leading-[110px] text-center text-[#FFDE00] [text-shadow:_5px_0_0_#3B4CCA,_-5px_0_0_#3B4CCA,_0_5px_0_#3B4CCA,_0_-5px_0_#3B4CCA] p-4`}
      >
        Pokedex
      </h1>
      <div className="flex items-center justify-center p-10 mx-20 gap-5 bg-white/70 border-[5px] border-[#3B4CCA] rounded-[25px] h-fit">
        <SearchForm
          query={query}
          onSearch={(newQuery) => {
            setQuery(newQuery);
            setDisplayCount(10); // Reset pagination on new search
          }}
        />
        <SortCriteriaSelect
          currentSort={sortCriteria}
          onChange={(newSort) => {
            setSortCriteria(newSort);
            setDisplayCount(10); // Reset pagination on sort change
          }}
        />
        <SortOrderToggle
          currentOrder={sortOrder}
          onChange={(newOrder) => {
            setSortOrder(newOrder);
            setDisplayCount(10); // Reset pagination on order change
          }}
        />
      </div>
      <section className="mx-20 mb-20 items-center justify-center">
        <p className="m-5  italic">
          {query ? `Search results for "${query}"` : "All Pokemon"}
        </p>
        {isLoading && completeList.length === 0 ? (
          <div>Loading Pokémon...</div>
        ) : (
          <>
            <ul className="mt-7 grid md:grid-cols-5 sm:grid-cols-3 gap-5 justify-center">
              {displayedPokemon.map((pokemon) => (
                <PokemonCard
                  key={`pokemon-${pokemon.id}`}
                  post={pokemon}
                  hasQuery={!!query}
                  pokemonList={completeList.map((p) => ({
                    id: p.id,
                    name: p.name,
                    types: [],
                  }))}
                />
              ))}
            </ul>
            {!query && displayedPokemon.length < completeList.length && (
              <LoadMore onClick={handleLoadMore} isLoading={isLoading} />
            )}
          </>
        )}
      </section>
    </main>
  );
}

// "use client";
// import { useState, useEffect } from "react";
// import { useRouter, usePathname, useSearchParams } from "next/navigation";
// import LoadMore from "@/components/LoadMore";
// import PokemonCard from "@/components/PokemonCard";
// import SearchForm from "@/components/SearchForm";
// import SortCriteriaSelect from "@/components/SortCriteriaSelect";
// import SortOrderToggle from "@/components/SortOrderToggle";
// import { formatIdNum } from "@/lib/utils";
// import localFont from "next/font/local";

// const ketchum = localFont({
//   src: "./fonts/Ketchum.otf",
// });

// interface Pokemon {
//   id: number;
//   name: string;
//   types?: string[];
// }

// export default function ClientHome() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const initialQuery = searchParams.get("query") || "";
//   const initialSort = searchParams.get("sort") || "id";
//   const initialOrder = searchParams.get("order") || "asc";

//   const [displayCount, setDisplayCount] = useState(10);
//   const [isLoading, setIsLoading] = useState(true);
//   const [completeList, setCompleteList] = useState<
//     { id: number; name: string }[]
//   >([]);
//   const [displayedPokemon, setDisplayedPokemon] = useState<Pokemon[]>([]);

//   const [query, setQuery] = useState(initialQuery);
//   const [sortCriteria, setSortCriteria] = useState(initialSort);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
//     initialOrder as "asc" | "desc"
//   );

//   const updateUrlParams = () => {
//     const params = new URLSearchParams();
//     if (query) params.set("query", query);
//     if (sortCriteria !== "id") params.set("sort", sortCriteria);
//     if (sortOrder !== "asc") params.set("order", sortOrder);
//     router.replace(`${pathname}?${params.toString()}`);
//   };

//   const fetchPokemonDetails = async (id: number): Promise<Pokemon> => {
//     const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
//     const data = await res.json();
//     return {
//       id: id,
//       name: data.name,
//       types: data.types.map((t: { type: { name: string } }) => t.type.name),
//     };
//   };

//   useEffect(() => {
//     const params = new URLSearchParams();
//     if (query) params.set("query", query);
//     if (sortCriteria !== "id") params.set("sort", sortCriteria);
//     if (sortOrder !== "asc") params.set("order", sortOrder);
//     router.replace(`${pathname}?${params.toString()}`);
//   }, [query, sortCriteria, sortOrder]);

//   // Fetch complete list of Pokémon (names/IDs only)
//   useEffect(() => {
//     const fetchCompleteList = async () => {
//       setIsLoading(true);
//       try {
//         const countRes = await fetch("https://pokeapi.co/api/v2/pokemon");
//         const countData = await countRes.json();
//         const allRes = await fetch(
//           `https://pokeapi.co/api/v2/pokemon?limit=${countData.count}`
//         );
//         const allData = await allRes.json();

//         const list = allData.results.map(
//           (p: { name: string; url: string }) => ({
//             id: parseInt(p.url.split("/").filter(Boolean).pop() || "0"),
//             name: p.name,
//           })
//         );

//         setCompleteList(list);
//       } catch (error) {
//         console.error("Failed to fetch Pokémon list:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCompleteList();
//   }, []);

//   // Update URL when search/sort changes
//   useEffect(() => {
//     updateUrlParams();
//   }, [query, sortCriteria, sortOrder]);

//   // Filter, sort and fetch details for displayed Pokémon
//   useEffect(() => {
//     const updateDisplayedPokemon = async () => {
//       if (completeList.length === 0) return;

//       setIsLoading(true);
//       try {
//         // Filter based on query
//         let filtered = query
//           ? completeList.filter(
//               (pokemon) =>
//                 pokemon.name.toLowerCase().includes(query.toLowerCase()) ||
//                 pokemon.id.toString() === query ||
//                 formatIdNum(pokemon.id) === query ||
//                 formatIdNum(pokemon.id).includes(query)
//             )
//           : completeList;

//         // Sort the filtered list
//         filtered = [...filtered].sort((a, b) => {
//           if (sortCriteria === "name") {
//             return sortOrder === "asc"
//               ? a.name.localeCompare(b.name)
//               : b.name.localeCompare(a.name);
//           }
//           return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
//         });

//         // Slice based on display count (only when not searching)
//         const toDisplay = query ? filtered : filtered.slice(0, displayCount);

//         // Fetch details for the Pokémon to display
//         const detailed = await Promise.all(
//           toDisplay.map((p) => fetchPokemonDetails(p.id))
//         );

//         setDisplayedPokemon(detailed);
//       } catch (error) {
//         console.error("Failed to update displayed Pokémon:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     updateDisplayedPokemon();
//   }, [completeList, query, sortCriteria, sortOrder, displayCount]);

//   const handleLoadMore = () => {
//     setDisplayCount((prev) => prev + 10);
//   };

//   const handleSearch = (newQuery: string) => {
//     setQuery(newQuery);
//     setDisplayCount(10); // Reset display count on new search
//   };

//   const handleSortChange = (newSort: string) => {
//     setSortCriteria(newSort);
//     setDisplayCount(10); // Reset display count on sort change
//   };

//   const handleOrderChange = (newOrder: "asc" | "desc") => {
//     setSortOrder(newOrder);
//     setDisplayCount(10); // Reset display count on order change
//   };

//   return (
//     <main>
//       <h1
//         className={`${ketchum.className} text-7xl leading-[110px] text-center text-[#FFDE00] [text-shadow:_5px_0_0_#3B4CCA,_-5px_0_0_#3B4CCA,_0_5px_0_#3B4CCA,_0_-5px_0_#3B4CCA] p-4`}
//       >
//         Pokedex
//       </h1>
//       <div className="flex items-center justify-center p-10 mx-20 gap-5 bg-white/70 border-[5px] border-[#3B4CCA] rounded-[25px] h-fit">
//         <SearchForm
//           query={query}
//           onSearch={(newQuery) => {
//             setQuery(newQuery);
//             setDisplayCount(10); // Reset pagination on new search
//           }}
//         />
//         <SortCriteriaSelect
//           currentSort={sortCriteria}
//           onChange={(newSort) => {
//             setSortCriteria(newSort);
//             setDisplayCount(10); // Reset pagination on sort change
//           }}
//         />
//         <SortOrderToggle
//           currentOrder={sortOrder}
//           onChange={(newOrder) => {
//             setSortOrder(newOrder);
//             setDisplayCount(10); // Reset pagination on order change
//           }}
//         />
//       </div>
//       <section className="mx-20 mb-20 items-center justify-center">
//         <p className="m-5  italic">
//           {query ? `Search results for "${query}"` : "All Pokemon"}
//         </p>
//         {isLoading && completeList.length === 0 ? (
//           <div>Loading Pokémon...</div>
//         ) : (
//           <>
//             <ul className="mt-7 grid md:grid-cols-5 sm:grid-cols-3 gap-5 justify-center">
//               {displayedPokemon.map((pokemon) => (
//                 <PokemonCard
//                   key={`pokemon-${pokemon.id}`}
//                   post={pokemon}
//                   hasQuery={!!query}
//                   pokemonList={completeList.map((p) => ({
//                     id: p.id,
//                     name: p.name,
//                     types: [],
//                   }))}
//                 />
//               ))}
//             </ul>
//             {!query && displayedPokemon.length < completeList.length && (
//               <LoadMore onClick={handleLoadMore} isLoading={isLoading} />
//             )}
//           </>
//         )}
//       </section>
//     </main>
//   );
// }
