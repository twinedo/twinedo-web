'use client'
import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { IoMdMail, IoLogoLinkedin, IoLogoGithub } from "react-icons/io";

export function Socmed() {
  const socialLinks = useMemo(
    () => [
      {
        href: "mailto:twinedo.dev@gmail.com",
        icon: <IoMdMail size={18} />,
        label: "Email",
        color: "text-red-500",
        hoverColor: "hover:text-red-400",
      },
      {
        href: "https://www.linkedin.com/in/twinedo/",
        icon: <IoLogoLinkedin size={18} />,
        label: "LinkedIn",
        color: "text-blue-500",
        hoverColor: "hover:text-blue-400",
      },
      {
        href: "https://www.github.com/twinedo/",
        icon: <IoLogoGithub size={18} />,
        label: "GitHub",
        color: "text-gray-700",
        hoverColor: "hover:text-gray-600",
      },
    ],
    []
  );

  return (
    <motion.div
      className="
        fixed
        left-4
        top-1/2
        -translate-y-1/2
        bg-white/80
        backdrop-blur-md
        border
        border-white/30
        p-2
        rounded-xl
        z-40
        hidden
        md:flex
        shadow-lg
        shadow-black/5
      "
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <div className="flex flex-col space-y-2">
        {socialLinks.map((link, index) => (
          <motion.div
            key={link.href}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
          >
            <Link
              href={link.href}
              rel="noreferrer"
              target="_blank"
              aria-label={link.label}
            >
              <motion.div 
                className={`
                  p-2.5 rounded-lg
                  ${link.color} ${link.hoverColor}
                  transition-all duration-200
                  hover:bg-gray-50
                  active:scale-95
                `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {link.icon}
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
