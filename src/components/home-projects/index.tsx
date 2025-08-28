'use client'
import Slider from "react-slick";
import { BiChevronRight } from "react-icons/bi";
import { AiOutlineMobile } from "react-icons/ai";
import { TbWorld } from "react-icons/tb";
import { ArrowRightIcon, EyeIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Section } from "../section";
import type { Project } from "@/shared";
import { useGetProjects } from "../../services/projects";
import { formatDescription } from "@/utils/const";
import { useRouter } from "next/navigation";
import usePassDetailStore from "@/stores/pass-detail-store";

export function HomeProjects() {
  const router = useRouter()
  const { data: dataList } = useGetProjects("mobile");
  const setData = usePassDetailStore(state => state.setData)

  const settings = {
    dots: true,
    infinite: dataList && dataList?.length > 3,
    arrows: false,
    autoplay: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    customPaging: () => (
      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white/30 rounded-full mt-6 sm:mt-8 hover:bg-white/60 transition-colors" />
    ),
    dotsClass: "slick-dots custom-dots",
  };

  const onNavigate = (data: Project) => {
    setData(data)
    router.push("/projects/detail");
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px]" />
      
      <Section className="relative z-10">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <motion.div 
            className="flex flex-col space-y-8 sm:space-y-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 px-2">
              <motion.div 
                className="flex flex-col space-y-3 sm:space-y-4"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <h2 className="text-white font-bold text-xl sm:text-2xl md:text-3xl tracking-wide">
                    FEATURED PROJECTS
                  </h2>
                  <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
                </div>
                <p className="text-blue-100/80 text-base sm:text-lg max-w-2xl">
                  Explore my latest work in mobile development
                </p>
              </motion.div>
              
              <motion.div
                className="group"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  onClick={() => router.push("/projects")}
                  className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl cursor-pointer hover:bg-white/20 transition-all duration-300 group"
                >
                  <span className="text-white font-semibold group-hover:text-blue-200 transition-colors text-sm sm:text-base">
                    View All Projects
                  </span>
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:translate-x-1 group-hover:text-blue-200 transition-all" />
                </div>
              </motion.div>
            </div>

            {/* Projects Slider */}
            <motion.div
              className="relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Slider {...settings}>
                {dataList &&
                  dataList.slice(0, 4).map((project: Project, index) => (
                    <div key={project.key} className="px-1.5 sm:px-3">
                      <motion.div
                        className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 cursor-pointer h-72 sm:h-80"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -4, scale: 1.01 }}
                        onClick={() => onNavigate(project)}
                      >
                        {/* Project Image */}
                        <div className="relative h-44 sm:h-48 overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                          <img
                            src={project.display}
                            alt={project.project_name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          
                          {/* Platform icon */}
                          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
                            <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20">
                              {project.platform === "mobile" ? (
                                <AiOutlineMobile className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                              ) : (
                                <TbWorld className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                              )}
                            </div>
                          </div>
                          
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                            <div className="flex items-center gap-2 text-white font-semibold">
                              <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="text-sm sm:text-base">View Project</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <h3 className="text-white text-lg sm:text-xl font-bold group-hover:text-blue-200 transition-colors line-clamp-1">
                              {project.project_name}
                            </h3>
                            <p className="text-blue-100/60 text-xs sm:text-sm line-clamp-2">
                              {formatDescription(project.description) || 'Mobile application built with modern technologies'}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between pt-1 sm:pt-2">
                            <span className="text-blue-200 text-xs sm:text-sm font-medium bg-blue-500/20 px-2 sm:px-3 py-1 rounded-full">
                              {project.year}
                            </span>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-white/60 group-hover:text-blue-200 transition-colors">
                              <span className="text-xs sm:text-sm">Learn more</span>
                              <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Animated border */}
                        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-transparent group-hover:border-blue-400/50 transition-all duration-300" />
                      </motion.div>
                    </div>
                  ))}
              </Slider>
            </motion.div>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
