"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { formatIdNum, capitalize } from "@/lib/utils";
import { typeColors } from "./PokemonCard";
import { CircleChevronRight, CircleChevronLeft, X } from "lucide-react";
import { useState, useEffect } from "react";

interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprites?: {
    front_default?: string;
    other?: {
      "official-artwork"?: {
        front_default?: string;
      };
    };
  };
}

interface PokemonDetails {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  height: number;
  weight: number;
  sprites: {
    front_default?: string;
    other?: {
      "official-artwork"?: {
        front_default?: string;
      };
    };
  };
  species: {
    name: string;
    url: string;
  };
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
}

interface PokemonSpecies {
  genera: { genus: string; language: { name: string } }[];
  generation: { name: string };
  gender_rate: number;
}

interface PokemonDetailsModalProps {
  pokemon: Pokemon;
  onClose: () => void;
  pokemonList?: Pokemon[];
}

const weaknessChart: Record<string, string[]> = {
  normal: ["fighting"],
  fire: ["water", "ground", "rock"],
  water: ["electric", "grass"],
  electric: ["ground"],
  grass: ["fire", "ice", "poison", "flying", "bug"],
  ice: ["fire", "fighting", "rock", "steel"],
  fighting: ["flying", "psychic", "fairy"],
  poison: ["ground", "psychic"],
  ground: ["water", "grass", "ice"],
  flying: ["electric", "ice", "rock"],
  psychic: ["bug", "ghost", "dark"],
  bug: ["fire", "flying", "rock"],
  rock: ["water", "grass", "fighting", "ground", "steel"],
  ghost: ["ghost", "dark"],
  dragon: ["ice", "dragon", "fairy"],
  dark: ["fighting", "bug", "fairy"],
  steel: ["fire", "fighting", "ground"],
  fairy: ["poison", "steel"],
};

export default function PokemonDetailsModal({
  pokemon,
  onClose,
  pokemonList = [],
}: PokemonDetailsModalProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPokemon, setCurrentPokemon] = useState(pokemon);
  const [pokemonDetails, setPokemonDetails] = useState<PokemonDetails | null>(
    null
  );
  const [pokemonSpecies, setPokemonSpecies] = useState<PokemonSpecies | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"about" | "stats">("about");
  const [loading, setLoading] = useState(false);

  // Fetch Pokemon details
  const fetchPokemonDetails = async (pokemonId: number) => {
    setLoading(true);
    try {
      const [detailsResponse, speciesResponse] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`),
      ]);

      const details = await detailsResponse.json();
      const species = await speciesResponse.json();

      setPokemonDetails(details);
      setPokemonSpecies(species);
    } catch (error) {
      console.error("Error fetching Pokemon details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update current pokemon when prop changes
  useEffect(() => {
    setCurrentPokemon(pokemon);
    fetchPokemonDetails(pokemon.id);
  }, [pokemon]);

  // Navigation function
  const navigatePokemon = (direction: "prev" | "next") => {
    if (pokemonList.length === 0 || isNavigating) return;

    setIsNavigating(true);

    // Find current index in the provided pokemonList
    const currentIndex = pokemonList.findIndex(
      (p) => p.id === currentPokemon.id
    );
    if (currentIndex === -1) {
      setIsNavigating(false);
      return;
    }

    // Calculate next index with wrap-around
    // was let before
    const nextIndex =
      direction === "next"
        ? (currentIndex + 1) % pokemonList.length
        : (currentIndex - 1 + pokemonList.length) % pokemonList.length;

    const nextPokemon = pokemonList[nextIndex];

    // Update URL and state
    window.history.pushState({}, "", `?pokemonId=${nextPokemon.id}`);
    setCurrentPokemon(nextPokemon);
    fetchPokemonDetails(nextPokemon.id);

    setTimeout(() => setIsNavigating(false), 300);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigatePokemon("prev");
      if (e.key === "ArrowRight") navigatePokemon("next");
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPokemon, pokemonList, navigatePokemon, onClose]);

  // Get weaknesses
  const getWeaknesses = () => {
    if (!pokemonDetails) return [];
    const types = pokemonDetails.types.map((t) => t.type.name);
    const weaknesses = new Set<string>();

    types.forEach((type) => {
      weaknessChart[type]?.forEach((weakness) => weaknesses.add(weakness));
    });

    return Array.from(weaknesses);
  };

  // Get category
  const getCategory = () => {
    if (!pokemonSpecies) return "";
    const englishGenus = pokemonSpecies.genera.find(
      (g) => g.language.name === "en"
    );
    return englishGenus?.genus || "";
  };

  // Get generation
  const getGeneration = () => {
    if (!pokemonSpecies) return "";
    return pokemonSpecies.generation.name
      .replace("generation-", "")
      .toUpperCase();
  };

  // Get gender info
  const getGenderInfo = () => {
    if (!pokemonSpecies) return "";
    const genderRate = pokemonSpecies.gender_rate;
    if (genderRate === -1) return "Genderless";
    if (genderRate === 0) return "Male only";
    if (genderRate === 8) return "Female only";
    return "Male/Female";
  };

  // Image source
  const imageSrc =
    `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${formatIdNum(
      currentPokemon.id
    )}.png` ||
    pokemonDetails?.sprites?.other?.["official-artwork"]?.front_default ||
    pokemonDetails?.sprites?.front_default ||
    "/pokemon-placeholder.png";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Navigation Arrows */}
        {pokemonList.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePokemon("prev");
              }}
              disabled={isNavigating}
              className="absolute left-8 top-1/2 -translate-y-1/2 z-20 text-white hover:text-blue-400 transition-colors disabled:opacity-50"
              aria-label="Previous Pokemon"
            >
              <CircleChevronLeft size={64} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePokemon("next");
              }}
              disabled={isNavigating}
              className="absolute right-8 top-1/2 -translate-y-1/2 z-20 text-white hover:text-blue-400 transition-colors disabled:opacity-50"
              aria-label="Next Pokemon"
            >
              <CircleChevronRight size={64} />
            </button>
          </>
        )}

        {/* Modal content */}
        <motion.div
          key={currentPokemon.id}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 bg-white rounded-3xl border-4 border-[#3B4CCA] max-w-4xl w-full mx-4 overflow-hidden shadow-xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/80 hover:bg-red-500/20 transition-colors"
            aria-label="Close"
          >
            <X size={24} className="text-[#3B4CCA] hover:text-[#FF0000]" />
          </button>

          {/* Header */}
          <div className="text-center pt-8 pb-4">
            <div className="text-gray-500 text-lg font-medium">
              #{formatIdNum(currentPokemon.id)}
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mt-1">
              {capitalize(currentPokemon.name)}
            </h1>
          </div>

          {/* Pokemon Content */}
          <div className="grid md:grid-cols-2 gap-8 px-8 pb-8">
            {/* Left Side - Image */}
            <div className="flex flex-col items-center">
              <motion.div
                key={`image-${currentPokemon.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-80 h-80"
              >
                <Image
                  src={imageSrc}
                  alt={currentPokemon.name}
                  fill
                  className="object-contain"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/pokemon-placeholder.png";
                  }}
                />
              </motion.div>
            </div>

            {/* Right Side - Details */}
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex bg-gray-100 rounded-full p-1">
                {["about", "stats"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as typeof activeTab)}
                    className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-[#3B4CCA] text-white"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {capitalize(tab)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "about" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Pokemon Info */}
                  {!loading && pokemonDetails && pokemonSpecies && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Category:</span>
                          <div className="text-gray-600">{getCategory()}</div>
                        </div>
                        <div>
                          <span className="font-semibold">Generation:</span>
                          <div className="text-gray-600">{getGeneration()}</div>
                        </div>
                        <div>
                          <span className="font-semibold">Height:</span>
                          <div className="text-gray-600">
                            {(pokemonDetails.height / 10).toFixed(1)} m
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold">Weight:</span>
                          <div className="text-gray-600">
                            {(pokemonDetails.weight / 10).toFixed(1)} kg
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold">Gender:</span>
                          <div className="text-gray-600">{getGenderInfo()}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Types */}
                  <div>
                    <h3 className="font-bold text-lg mb-3">Type</h3>
                    <div className="flex flex-wrap gap-2">
                      {pokemonDetails?.types.map((typeInfo) => (
                        <motion.span
                          key={typeInfo.type.name}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className={`${
                            typeColors[
                              typeInfo.type.name as keyof typeof typeColors
                            ] || "bg-gray-200 text-gray-800"
                          } text-white px-6 py-2 rounded-full text-sm font-medium`}
                        >
                          {capitalize(typeInfo.type.name)}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <h3 className="font-bold text-lg mb-3">Weaknesses</h3>
                    <div className="flex flex-wrap gap-2">
                      {getWeaknesses().map((weakness) => (
                        <motion.span
                          key={weakness}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className={`${
                            typeColors[weakness as keyof typeof typeColors] ||
                            "bg-gray-200 text-gray-800"
                          } text-white px-4 py-2 rounded-full text-sm font-medium`}
                        >
                          {capitalize(weakness)}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "stats" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {pokemonDetails?.stats.map((stat) => (
                    <div key={stat.stat.name} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium capitalize">
                          {stat.stat.name.replace("-", " ")}
                        </span>
                        <span className="font-bold">{stat.base_stat}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#3B4CCA] h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              (stat.base_stat / 255) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {loading && (
                <div className="text-center text-gray-500">
                  Loading Pokemon details...
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// "use client";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import { formatIdNum, capitalize } from "@/lib/utils";
// import { typeColors } from "./PokemonCard";
// import { CircleChevronRight, CircleChevronLeft, X } from "lucide-react";
// import { useState, useEffect } from "react";

// interface Pokemon {
//   id: number;
//   name: string;
//   types: string[];
//   sprites?: {
//     front_default?: string;
//     other?: {
//       "official-artwork"?: {
//         front_default?: string;
//       };
//     };
//   };
// }

// interface PokemonDetails {
//   id: number;
//   name: string;
//   types: { type: { name: string } }[];
//   height: number;
//   weight: number;
//   sprites: {
//     front_default?: string;
//     other?: {
//       "official-artwork"?: {
//         front_default?: string;
//       };
//     };
//   };
//   species: {
//     name: string;
//     url: string;
//   };
//   stats: {
//     base_stat: number;
//     stat: {
//       name: string;
//     };
//   }[];
// }

// interface PokemonSpecies {
//   genera: { genus: string; language: { name: string } }[];
//   generation: { name: string };
//   gender_rate: number;
// }

// interface PokemonDetailsModalProps {
//   pokemon: Pokemon;
//   onClose: () => void;
//   pokemonList?: Pokemon[];
// }

// const weaknessChart: Record<string, string[]> = {
//   normal: ["fighting"],
//   fire: ["water", "ground", "rock"],
//   water: ["electric", "grass"],
//   electric: ["ground"],
//   grass: ["fire", "ice", "poison", "flying", "bug"],
//   ice: ["fire", "fighting", "rock", "steel"],
//   fighting: ["flying", "psychic", "fairy"],
//   poison: ["ground", "psychic"],
//   ground: ["water", "grass", "ice"],
//   flying: ["electric", "ice", "rock"],
//   psychic: ["bug", "ghost", "dark"],
//   bug: ["fire", "flying", "rock"],
//   rock: ["water", "grass", "fighting", "ground", "steel"],
//   ghost: ["ghost", "dark"],
//   dragon: ["ice", "dragon", "fairy"],
//   dark: ["fighting", "bug", "fairy"],
//   steel: ["fire", "fighting", "ground"],
//   fairy: ["poison", "steel"],
// };

// export default function PokemonDetailsModal({
//   pokemon,
//   onClose,
//   pokemonList = [],
// }: PokemonDetailsModalProps) {
//   const [isNavigating, setIsNavigating] = useState(false);
//   const [currentPokemon, setCurrentPokemon] = useState(pokemon);
//   const [pokemonDetails, setPokemonDetails] = useState<PokemonDetails | null>(
//     null
//   );
//   const [pokemonSpecies, setPokemonSpecies] = useState<PokemonSpecies | null>(
//     null
//   );
//   const [activeTab, setActiveTab] = useState<"about" | "stats">("about");
//   const [loading, setLoading] = useState(false);

//   // Fetch Pokemon details from PokeAPI
//   const fetchPokemonDetails = async (pokemonId: number) => {
//     setLoading(true);
//     try {
//       const [detailsResponse, speciesResponse] = await Promise.all([
//         fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`),
//         fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`),
//       ]);

//       const details = await detailsResponse.json();
//       const species = await speciesResponse.json();

//       setPokemonDetails(details);
//       setPokemonSpecies(species);
//     } catch (error) {
//       console.error("Error fetching Pokemon details:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update current pokemon when prop changes
//   useEffect(() => {
//     setCurrentPokemon(pokemon);
//     fetchPokemonDetails(pokemon.id);
//   }, [pokemon]);

//   // Find current index safely
//   const currentIndex = pokemonList.findIndex((p) => p.id === currentPokemon.id);

//   const navigatePokemon = (direction: "prev" | "next") => {
//     if (pokemonList.length === 0 || isNavigating) return;

//     setIsNavigating(true);

//     const newIndex =
//       direction === "next"
//         ? (currentIndex + 1) % pokemonList.length
//         : (currentIndex - 1 + pokemonList.length) % pokemonList.length;

//     const nextPokemon = pokemonList[newIndex];

//     // Update URL without page reload
//     window.history.pushState({}, "", `?pokemonId=${nextPokemon.id}`);
//     setCurrentPokemon(nextPokemon);
//     fetchPokemonDetails(nextPokemon.id);

//     // Reset navigation state after animation
//     setTimeout(() => setIsNavigating(false), 300);
//   };

//   // Keyboard navigation
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "ArrowLeft") navigatePokemon("prev");
//       if (e.key === "ArrowRight") navigatePokemon("next");
//       if (e.key === "Escape") onClose();
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [currentIndex, pokemonList]);

//   // Get Pokemon weaknesses
//   const getWeaknesses = () => {
//     if (!pokemonDetails) return [];
//     const types = pokemonDetails.types.map((t) => t.type.name);
//     const weaknesses = new Set<string>();

//     types.forEach((type) => {
//       const typeWeaknesses = weaknessChart[type] || [];
//       typeWeaknesses.forEach((weakness) => weaknesses.add(weakness));
//     });

//     return Array.from(weaknesses);
//   };

//   // Get Pokemon category
//   const getCategory = () => {
//     if (!pokemonSpecies) return "";
//     const englishGenus = pokemonSpecies.genera.find(
//       (g) => g.language.name === "en"
//     );
//     return englishGenus?.genus || "";
//   };

//   // Get generation
//   const getGeneration = () => {
//     if (!pokemonSpecies) return "";
//     return pokemonSpecies.generation.name
//       .replace("generation-", "")
//       .toUpperCase();
//   };

//   // Get gender info
//   const getGenderInfo = () => {
//     if (!pokemonSpecies) return "";
//     const genderRate = pokemonSpecies.gender_rate;
//     if (genderRate === -1) return "Genderless";
//     if (genderRate === 0) return "Male only";
//     if (genderRate === 8) return "Female only";
//     return "Male/Female";
//   };

//   // Fallback image source
//   const imageSrc =
//     `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${formatIdNum(
//       currentPokemon.id
//     )}.png` ||
//     pokemonDetails?.sprites?.other?.["official-artwork"]?.front_default ||
//     pokemonDetails?.sprites?.front_default ||
//     "/pokemon-placeholder.png";

//   return (
//     <>
//       <AnimatePresence>
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 z-50 flex items-center justify-center p-4"
//         >
//           {/* Backdrop */}
//           <motion.div
//             onClick={onClose}
//             className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//           />

//           {/* Navigation Arrows - Outside Modal */}
//           {pokemonList.length > 1 && (
//             <>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   navigatePokemon("prev");
//                 }}
//                 disabled={isNavigating}
//                 className="absolute left-8 top-1/2 -translate-y-1/2 z-20 text-white hover:text-blue-400 transition-colors disabled:opacity-50"
//                 aria-label="Previous Pokemon"
//               >
//                 <CircleChevronLeft size={64} />
//               </button>

//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   navigatePokemon("next");
//                 }}
//                 disabled={isNavigating}
//                 className="absolute right-8 top-1/2 -translate-y-1/2 z-20 text-white hover:text-blue-400 transition-colors disabled:opacity-50"
//                 aria-label="Next Pokemon"
//               >
//                 <CircleChevronRight size={64} />
//               </button>
//             </>
//           )}

//           {/* Modal content */}
//           <motion.div
//             key={currentPokemon.id}
//             initial={{ scale: 0.95, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.95, opacity: 0 }}
//             transition={{ duration: 0.2 }}
//             className="relative z-10 bg-white rounded-3xl border-4 border-[#3B4CCA] max-w-4xl w-full mx-4 overflow-hidden shadow-xl"
//           >
//             {/* Close Button */}
//             <button
//               onClick={onClose}
//               className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/80 hover:bg-red-500/20 transition-colors"
//               aria-label="Close"
//             >
//               <X size={24} className="text-[#3B4CCA] hover:text-[#FF0000]" />
//             </button>

//             {/* Header */}
//             <div className="text-center pt-8 pb-4">
//               <div className="text-gray-500 text-lg font-medium">
//                 #{formatIdNum(currentPokemon.id)}
//               </div>
//               <h1 className="text-4xl font-bold text-gray-800 mt-1">
//                 {capitalize(currentPokemon.name)}
//               </h1>
//             </div>

//             {/* Pokemon Content */}
//             <div className="grid md:grid-cols-2 gap-8 px-8 pb-8">
//               {/* Left Side - Image */}
//               <div className="flex flex-col items-center">
//                 <motion.div
//                   key={`image-${currentPokemon.id}`}
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   transition={{ duration: 0.3 }}
//                   className="relative w-80 h-80"
//                 >
//                   <Image
//                     src={imageSrc || "/placeholder.svg"}
//                     alt={currentPokemon.name}
//                     fill
//                     className="object-contain"
//                     priority
//                     onError={(e) => {
//                       const target = e.target as HTMLImageElement;
//                       target.src = "/pokemon-placeholder.png";
//                     }}
//                   />
//                 </motion.div>
//               </div>

//               {/* Right Side - Details */}
//               <div className="space-y-6">
//                 {/* Tabs */}
//                 <div className="flex bg-gray-100 rounded-full p-1">
//                   {["about", "stats"].map((tab) => (
//                     <button
//                       key={tab}
//                       onClick={() => setActiveTab(tab as typeof activeTab)}
//                       className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
//                         activeTab === tab
//                           ? "bg-[#3B4CCA] text-white"
//                           : "text-gray-600 hover:text-gray-800"
//                       }`}
//                     >
//                       {capitalize(tab)}
//                     </button>
//                   ))}
//                 </div>

//                 {/* Tab Content */}
//                 {activeTab === "about" && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="space-y-6"
//                   >
//                     {/* Pokemon Info */}
//                     {!loading && pokemonDetails && pokemonSpecies && (
//                       <div className="space-y-4">
//                         <div className="grid grid-cols-2 gap-4 text-sm">
//                           <div>
//                             <span className="font-semibold">Category:</span>
//                             <div className="text-gray-600">{getCategory()}</div>
//                           </div>
//                           <div>
//                             <span className="font-semibold">Generation:</span>
//                             <div className="text-gray-600">
//                               {getGeneration()}
//                             </div>
//                           </div>
//                           <div>
//                             <span className="font-semibold">Height:</span>
//                             <div className="text-gray-600">
//                               {(pokemonDetails.height / 10).toFixed(1)} m
//                             </div>
//                           </div>
//                           <div>
//                             <span className="font-semibold">Weight:</span>
//                             <div className="text-gray-600">
//                               {(pokemonDetails.weight / 10).toFixed(1)} kg
//                             </div>
//                           </div>
//                           <div className="col-span-2">
//                             <span className="font-semibold">Gender:</span>
//                             <div className="text-gray-600">
//                               {getGenderInfo()}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {/* Types */}
//                     <div>
//                       <h3 className="font-bold text-lg mb-3">Type</h3>
//                       <div className="flex flex-wrap gap-2">
//                         {pokemonDetails?.types.map((typeInfo) => (
//                           <motion.span
//                             key={typeInfo.type.name}
//                             initial={{ scale: 0.8, opacity: 0 }}
//                             animate={{ scale: 1, opacity: 1 }}
//                             transition={{ delay: 0.1 }}
//                             className={`${
//                               typeColors[
//                                 typeInfo.type.name as keyof typeof typeColors
//                               ] || "bg-gray-200 text-gray-800"
//                             } text-white px-6 py-2 rounded-full text-sm font-medium`}
//                           >
//                             {capitalize(typeInfo.type.name)}
//                           </motion.span>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Weaknesses */}
//                     <div>
//                       <h3 className="font-bold text-lg mb-3">Weaknesses</h3>
//                       <div className="flex flex-wrap gap-2">
//                         {getWeaknesses().map((weakness) => (
//                           <motion.span
//                             key={weakness}
//                             initial={{ scale: 0.8, opacity: 0 }}
//                             animate={{ scale: 1, opacity: 1 }}
//                             transition={{ delay: 0.2 }}
//                             className={`${
//                               typeColors[weakness as keyof typeof typeColors] ||
//                               "bg-gray-200 text-gray-800"
//                             } text-white px-4 py-2 rounded-full text-sm font-medium`}
//                           >
//                             {capitalize(weakness)}
//                           </motion.span>
//                         ))}
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}

//                 {activeTab === "stats" && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="space-y-4"
//                   >
//                     {pokemonDetails?.stats.map((stat) => (
//                       <div key={stat.stat.name} className="space-y-2">
//                         <div className="flex justify-between">
//                           <span className="font-medium capitalize">
//                             {stat.stat.name.replace("-", " ")}
//                           </span>
//                           <span className="font-bold">{stat.base_stat}</span>
//                         </div>
//                         <div className="w-full bg-gray-200 rounded-full h-2">
//                           <div
//                             className="bg-[#3B4CCA] h-2 rounded-full transition-all duration-500"
//                             style={{
//                               width: `${Math.min(
//                                 (stat.base_stat / 255) * 100,
//                                 100
//                               )}%`,
//                             }}
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </motion.div>
//                 )}

//                 {/* {activeTab === "evolution" && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="text-center text-gray-500"
//                   >
//                     Evolution chain coming soon...
//                   </motion.div>
//                 )} */}

//                 {loading && (
//                   <div className="text-center text-gray-500">
//                     Loading Pokemon details...
//                   </div>
//                 )}
//               </div>
//             </div>
//           </motion.div>
//         </motion.div>
//       </AnimatePresence>
//     </>
//   );
// }
