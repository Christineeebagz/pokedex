"use client";
import { capitalize, formatIdNum } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react"; // Add useEffect
import PokemonDetailsModal from "./PokemonDetailsModal";
import { motion } from "framer-motion";

export const typeColors = {
  normal: "bg-gray-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-blue-200",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-700",
  flying: "bg-indigo-300",
  psychic: "bg-pink-500",
  bug: "bg-green-400",
  rock: "bg-yellow-600",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-700",
  dark: "bg-gray-700",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
};

interface Pokemon {
  id: number;
  name: string;
  types: string[];
}

const PokemonCard = ({
  post,
  pokemonList,
  hasQuery = false, // Add this prop to indicate if there's a search query
}: {
  post: Pokemon;
  pokemonList?: Pokemon[];
  hasQuery?: boolean;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pokemonTypes, setPokemonTypes] = useState<string[]>(post.types ?? []);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const { id, name } = post;

  useEffect(() => {
    if (hasQuery && pokemonTypes.length === 0 && !isLoadingTypes) {
      const fetchTypes = async () => {
        setIsLoadingTypes(true);
        try {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          const data = await res.json();
          const types =
            data.types?.map((t: { type: { name: string } }) => t.type.name) ||
            [];
          setPokemonTypes(types);
        } catch (error) {
          console.error("Failed to fetch Pokemon types:", error);
          setPokemonTypes([]);
        } finally {
          setIsLoadingTypes(false);
        }
      };
      fetchTypes();
    }
  }, [id, hasQuery, pokemonTypes.length, isLoadingTypes]);

  useEffect(() => {
    // Only fetch types if there's a query and types aren't already loaded
    if (hasQuery && (!pokemonTypes || pokemonTypes.length === 0)) {
      const fetchTypes = async () => {
        try {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          const data = await res.json();
          const types = data.types.map(
            (t: { type: { name: string } }) => t.type.name
          );
          setPokemonTypes(types);
        } catch (error) {
          console.error("Failed to fetch Pokemon types:", error);
          setPokemonTypes([]);
        }
      };
      fetchTypes();
    }
  }, [id, hasQuery, pokemonTypes]);

  return (
    <>
      <motion.li
        whileHover={{ y: -5 }}
        onClick={() => setIsModalOpen(true)}
        className="group flex w-full flex-col justify-center items-center bg-white border-[5px] border-[#3B4CCA] py-6 px-5 rounded-[25px] shadow-200 hover:border-[#FFDE00] transition-all duration-500 hover:shadow-300 hover:bg-[#FFDE00] cursor-pointer"
      >
        <div className="flex-col flex justify-center items-center">
          <div className=" flex-col justify-center items-center gap-1 mb-2">
            <p className="text-sm leading-tight text-center text-gray-500">
              #{formatIdNum(id)}
            </p>
            <p className="font-extrabold text-xl leading-8 text-center text-black">
              {capitalize(name)}
            </p>
          </div>
          <Image
            alt="Picture of Pokemon"
            width={180}
            height={180}
            className="mx-auto"
            src={`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${formatIdNum(
              id
            )}.png`}
          />
        </div>
        <div className="flex gap-2 mt-2">
          {pokemonTypes.map((type: string) => (
            <span
              key={type}
              className={`${
                typeColors[type as keyof typeof typeColors]
              } text-white text-s font-medium px-2.5 py-0.5 rounded-full`}
            >
              {capitalize(type)}
            </span>
          ))}
        </div>
      </motion.li>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <PokemonDetailsModal
            pokemon={{ ...post, types: pokemonTypes }}
            onClose={() => setIsModalOpen(false)}
            pokemonList={pokemonList}
          />
        </motion.div>
      )}
    </>
  );
};

export default PokemonCard;
