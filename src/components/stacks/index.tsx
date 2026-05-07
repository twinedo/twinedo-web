'use client'
import Slider from "react-slick";
import { motion } from "framer-motion";
import { arrImages } from "../../utils/const";
import { Section } from "../section";

export function Stacks() {
  const settings = {
    dots: false,
    infinite: arrImages.length > 3,
    arrows: false,
    autoplay: true,
    speed: 3000,
    autoplaySpeed: 0,
    cssEase: "linear",
    slidesToShow: 6,
    slidesToScroll: 1,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 360,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="relative bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] animate-pulse" />
      
      <Section className="relative z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <motion.div 
            className="space-y-8 sm:space-y-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Header */}
            <motion.div 
              className="text-center space-y-4 sm:space-y-6 px-2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center space-x-2 sm:space-x-4">
                <div className="h-1 w-8 sm:w-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
                <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                  TECHNOLOGY STACK
                </h2>
                <div className="h-1 w-8 sm:w-16 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full" />
              </div>
              <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto px-4">
                Technologies and tools I use to bring ideas to life
              </p>
            </motion.div>

            {/* Tech Stack Carousel */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-3 sm:p-6 md:p-8">
                <Slider {...settings}>
                  {arrImages.map((tech, index) => (
                    <motion.div 
                      key={tech.id} 
                      className="px-1 sm:px-2 md:px-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <motion.div 
                        className="group relative p-2 sm:p-4 md:p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all duration-500 cursor-pointer"
                        whileHover={{ 
                          scale: 1.05, 
                          y: -5,
                          rotate: [0, 1, -1, 0],
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                        
                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center space-y-2 sm:space-y-3">
                          <div className="relative">
                            <img
                              src={tech.path}
                              alt={tech.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            />
                            {/* Animated ring */}
                            <div className="absolute inset-0 border-2 border-blue-400/0 group-hover:border-blue-400/50 rounded-full group-hover:animate-spin transition-all duration-300" />
                          </div>
                          
                          <div className="text-center">
                            <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base group-hover:text-blue-200 transition-colors leading-tight">
                              {tech.name}
                            </h3>
                          </div>
                          
                          {/* Hover indicator */}
                          <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-300" />
                        </div>
                        
                        {/* Animated border */}
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-transparent group-hover:border-blue-400/30 transition-all duration-300" />
                      </motion.div>
                    </motion.div>
                  ))}
                </Slider>
                
                {/* Gradient overlays - smaller on mobile */}
                <div className="absolute left-0 top-0 w-8 sm:w-12 md:w-20 h-full bg-gradient-to-r from-gray-900/50 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 w-8 sm:w-12 md:w-20 h-full bg-gradient-to-l from-gray-900/50 to-transparent z-10 pointer-events-none" />
              </div>
            </motion.div>
            
            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-12 px-2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
            >
              {[
                { label: "Technologies", value: `${arrImages.length}+` },
                { label: "Years Experience", value: "6+" },
                { label: "Projects", value: "20+" },
                { label: "Happy Clients", value: "10+" }
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  className="text-center p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    {stat.value}
                  </div>
                  <div className="text-gray-300 text-xs sm:text-sm mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
