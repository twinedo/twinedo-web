"use client";
import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header = () => {
  const pathname = usePathname();
  console.log("pathname", pathname);

  const navItems = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/projects", label: "Projects" },
      { to: "/cv", label: "CV" },
    ],
    []
  );

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white fixed top-0 left-0 w-full shadow-xl z-100">
      <div className="container mx-auto max-w-[1280px]  p-4 flex justify-between items-center">
        <div className="flex-row flex gap-x-1 items-center">
          <img
            src="/img/profile.jpeg"
            alt="Logo"
            className="h-10 w-10 mr-2 rounded-full"
          />
          <span className="text-xl font-semibold">twinedo</span>
        </div>
        <nav className="flex gap-x-4">
          {navItems.map((item) => (
            <Link key={item.to} href={item.to}>
              <div
                className={
                  isActive(item.to)
                    ? "text-gray-700 font-bold"
                    : "text-gray-400 font-bold"
                }
              >
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};
