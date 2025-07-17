'use client'
import Link from "next/link";
import { useMemo } from "react";
import { IoMdMail, IoLogoLinkedin, IoLogoGithub } from "react-icons/io";

export function Socmed() {
  const socialLinks = useMemo(
    () => [
      {
        href: "mailto:twinedo.dev@gmail.com",
        icon: <IoMdMail size={24} color="black" />,
        label: "Email",
      },
      {
        href: "https://www.linkedin.com/in/twinedo/",
        icon: <IoLogoLinkedin size={24} color="black" />,
        label: "LinkedIn",
      },
      {
        href: "https://www.github.com/twinedo/",
        icon: <IoLogoGithub size={24} color="black" />,
        label: "GitHub",
      },
    ],
    []
  );

  return (
    <div
      className="
      fixed
      left-0
      top-1/2
      -translate-y-1/2
      bg-white
      p-5
      shadow-[0_7px_29px_0_rgba(100,100,111,0.2)]
      rounded-r-lg
      z-10
      hidden
      md:flex
    "
    >
      <div className="flex flex-col space-y-4">
        {socialLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            rel="noreferrer"
            target="_blank"
            aria-label={link.label}
          >
              {link.icon}
          </Link>
        ))}
      </div>
    </div>
  );
}
