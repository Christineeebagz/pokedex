"use client";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon } from "lucide-react";

interface SortCriteriaSelectProps {
  currentSort: string;
  onChange: (sort: string) => void;
}

export default function SortCriteriaSelect({
  currentSort,
  onChange,
}: SortCriteriaSelectProps) {
  const sortOptions = [
    { value: "id", label: "Sort by ID" },
    { value: "name", label: "Sort by Name" },
  ];

  return (
    <Menu
      as="div"
      className="relative flex text-left min-w-[150px] w-auto mx-5"
    >
      <div>
        <Menu.Button className="inline-flex w-full justify-between items-center gap-x-1.5 rounded-[10px] bg-white px-4 py-2 text-[#3B4CCA] border-[3px] border-[rgba(59,76,202,0.5)] hover:bg-gray-50 transition-colors whitespace-nowrap">
          {sortOptions.find((opt) => opt.value === currentSort)?.label}
          <ChevronDownIcon
            className="h-5 w-5 text-[#3B4CCA] flex-shrink-0"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-[10px] bg-white shadow-lg border-[3px] border-[rgba(59,76,202,0.5)] focus:outline-none min-w-[150px]">
          <div className="py-1">
            {sortOptions.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => onChange(option.value)}
                    className={`${
                      active ? "bg-[#3B4CCA] text-white" : "text-gray-700"
                    } block w-full px-4 py-2 text-left whitespace-nowrap ${
                      currentSort === option.value
                        ? "font-bold text-[#3B4CCA]"
                        : ""
                    }`}
                  >
                    {option.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
