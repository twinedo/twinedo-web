"use client";
import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CodeBracketIcon, DocumentIcon, RectangleStackIcon } from "@heroicons/react/24/outline";

export const Header = () => {
  const pathname = usePathname();
  const navigation = useRouter()

  const navItems = useMemo(
    () => [
      { to: "/", label: "Home", icon: <CodeBracketIcon className="w-4 h-4" /> },
      { to: "/projects", label: "Projects", icon: <RectangleStackIcon className="w-4 h-4" /> },
      { to: "/cv", label: "CV", icon: <DocumentIcon className="w-4 h-4" /> },
    ],
    []
  );

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <motion.header 
      className="
        bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-slate-900/80
        backdrop-blur-3xl 
        border-b 
        border-white/5 
        fixed 
        top-0 
        left-0 
        w-full 
        z-50 
        shadow-2xl 
        shadow-black/50
        supports-[backdrop-filter]:bg-gradient-to-br supports-[backdrop-filter]:from-slate-900/60 supports-[backdrop-filter]:via-blue-900/50 supports-[backdrop-filter]:to-slate-900/60
      "
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Enhanced glassmorphism overlay layers */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/8 to-cyan-500/5" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/10 to-slate-900/20" />
      <div className="absolute inset-0 backdrop-saturate-150 backdrop-brightness-110" />
      
      <div className="relative container mx-auto max-w-[1280px] p-4 flex justify-between items-center">
        {/* Logo */}
        <motion.div 
          className="flex-row flex gap-x-3 items-center group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigation.replace('/')}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/30 to-purple-400/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              src="/img/logo.png"
              alt="Logo"
              className="relative h-10 w-10 rounded-full ring-2 ring-white/20 group-hover:ring-blue-400/60 transition-all duration-300 shadow-lg"
            />
          </div>
          <div className="md:flex flex-col hidden ">
            <span className="text-lg font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300">
              twinedo
            </span>
            <span className="text-xs text-blue-200/70">
              Frontend Developer
            </span>
          </div>
        </motion.div>
        
        {/* Navigation */}
        <nav className="flex gap-x-1">
          {navItems.map((item, index) => {
            const active = isActive(item.to);
            return (
              <Link key={item.to} href={item.to}>
                <motion.div
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
                    ${
                      active
                        ? "text-white bg-gradient-to-r from-blue-500/30 via-white/20 to-purple-500/30 shadow-lg backdrop-blur-xl border border-white/30 shadow-blue-500/20"
                        : "text-blue-100/80 hover:text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:via-white/10 hover:to-purple-500/20 backdrop-blur-sm border border-transparent hover:border-white/20"
                    }
                  `}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Enhanced glassmorphism effect for active tab */}
                  {active && (
                    <>
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-blue-400/25 via-white/15 to-purple-400/25 rounded-xl backdrop-blur-2xl"
                        layoutId="activeGlass"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 to-blue-600/10 rounded-xl border border-white/40 shadow-inner"
                        layoutId="activeGlassInner"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6, delay: 0.1 }}
                      />
                    </>
                  )}
                  
                  <span className="relative z-10 hidden sm:block">{item.icon}</span>
                  <span className="relative z-10">{item.label}</span>
                  
                  {/* Enhanced active indicator with glow */}
                  {active && (
                    <motion.div 
                      className="absolute -bottom-0.5 left-1/2 w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-lg shadow-blue-400/60"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{ x: "-50%" }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full blur-sm animate-pulse" />
                    </motion.div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
};
