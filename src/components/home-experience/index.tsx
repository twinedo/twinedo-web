"use client";
import { useGetExperiences } from "@/services/experiences";
import { motion } from "framer-motion";
import { BriefcaseIcon, CalendarIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Section } from "../section";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Experience } from "@/shared";

export function HomeExperience() {
  const router = useRouter();
  const { data } = useGetExperiences();
  
  return (
    <div className="relative bg-gradient-to-br from-white via-blue-50 to-indigo-100 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl" />
      </div>
      
      <Section className="relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="space-y-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Header */}
            <motion.div 
              className="text-center space-y-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center space-x-4">
                <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                <h2 className="font-bold text-3xl md:text-4xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  PROFESSIONAL EXPERIENCE
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
              </div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                My journey through various roles in frontend development and technology
              </p>
            </motion.div>

            {/* Experience Cards */}
            <div className="grid gap-8 md:gap-12">
              {data &&
                data.slice(0, 2).map((item: Experience, index) => (
                  <motion.div
                    key={item.id}
                    className="group"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] hover:bg-white/80">
                      {/* Header */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                              <BriefcaseIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                {item.company}
                              </h3>
                              <p className="text-lg font-semibold text-blue-600">{item.position}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-xl">
                          <CalendarIcon className="w-5 h-5" />
                          <span className="font-medium">
                            {format(item.startDate, "MMM yyyy")} - 
                            {item.endDate ? format(item.endDate, "MMM yyyy") : "Present"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div className="space-y-4">
                        {item.description.map((desc, i) => (
                          <motion.div 
                            key={desc} 
                            className="flex items-start gap-4"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 + i * 0.1, duration: 0.4 }}
                            viewport={{ once: true }}
                          >
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                            <p className="text-gray-700 leading-relaxed text-lg">{desc}</p>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Decorative element */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </motion.div>
                ))}
            </div>
            
            {/* View More Button */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.button
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/cv#experiences")}
              >
                <span>View Complete Experience</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
