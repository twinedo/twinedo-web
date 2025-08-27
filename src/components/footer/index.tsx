import { HeartIcon, CodeBracketIcon } from "@heroicons/react/24/outline";
import { IoLogoGithub, IoLogoLinkedin, IoMdMail } from "react-icons/io";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="text-center space-y-8 animate-fade-in">
          {/* Main content */}
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 hover:scale-105 transition-transform duration-300">
              <CodeBracketIcon className="w-8 h-8 text-blue-400" />
              <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                Let's Build Something Amazing
              </h3>
              <CodeBracketIcon className="w-8 h-8 text-purple-400" />
            </div>
            
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              I'm always excited to work on new projects and collaborate with innovative teams.
              <br />Ready to turn your ideas into reality? Let's connect!
            </p>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-6">
            {[
              { 
                href: "mailto:twinedo.dev@gmail.com", 
                icon: <IoMdMail size={24} />, 
                label: "Email",
                color: "hover:text-red-400",
                bg: "hover:bg-red-400/10"
              },
              { 
                href: "https://www.linkedin.com/in/twinedo/", 
                icon: <IoLogoLinkedin size={24} />, 
                label: "LinkedIn",
                color: "hover:text-blue-400",
                bg: "hover:bg-blue-400/10"
              },
              { 
                href: "https://www.github.com/twinedo/", 
                icon: <IoLogoGithub size={24} />, 
                label: "GitHub",
                color: "hover:text-gray-300",
                bg: "hover:bg-gray-400/10"
              },
            ].map((social, index) => (
              <div key={social.href} className="transform hover:scale-110 transition-transform duration-200">
                <Link href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                  <div className={`p-4 text-gray-400 ${social.color} ${social.bg} border border-white/10 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 active:scale-95`}>
                    {social.icon}
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Copyright */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <span>Made with</span>
              <div className="animate-pulse">
                <HeartIcon className="w-5 h-5 text-red-400" />
              </div>
              <span>using Next.js & TypeScript</span>
            </div>
            
            <p className="text-sm text-gray-500">
              Copyright © 2025 twinedo.dev - All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}