"use client";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortOrderToggleProps {
  currentOrder: "asc" | "desc";
  onChange: (order: "asc" | "desc") => void;
}

export default function SortOrderToggle({
  currentOrder,
  onChange,
}: SortOrderToggleProps) {
  const orderOptions = [
    { value: "asc", label: "Ascending", icon: <ArrowUp className="h-4 w-4" /> },
    {
      value: "desc",
      label: "Descending",
      icon: <ArrowDown className="h-4 w-4" />,
    },
  ];

  return (
    <Menu as="div" className="relative inline-block text-left min-w-[150px]">
      <div>
        <Menu.Button className="inline-flex w-full justify-between items-center gap-x-1.5 rounded-[10px] bg-white px-4 py-2 text-[#3B4CCA] border-[3px] border-[rgba(59,76,202,0.5)] hover:bg-gray-50 transition-colors whitespace-nowrap">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            {orderOptions.find((opt) => opt.value === currentOrder)?.label}
          </div>
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
            {orderOptions.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => onChange(option.value as "asc" | "desc")}
                    className={`${
                      active ? "bg-[#3B4CCA] text-white" : "text-gray-700"
                    } flex items-center gap-2 w-full px-4 py-2 text-left whitespace-nowrap ${
                      currentOrder === option.value
                        ? "font-bold text-[#3B4CCA]"
                        : ""
                    }`}
                  >
                    {option.icon}
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
