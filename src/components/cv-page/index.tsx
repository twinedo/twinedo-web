
'use client'
import { FcDownload } from "react-icons/fc";
import { generateRandomLightColor } from "../../utils/color";
import { Section } from "../section";
import { Timeline } from "../timeline";
import { Stacks } from "../stacks";
import { Education } from "../education";
import { Certification } from "../certification";
import { useGetExperiences } from "../../services/experiences";
import { format } from "date-fns";
import { downloadCV } from "../../services/cv";

export function CVPage() {
  const {data} = useGetExperiences()

  const onDownloadClick = async () => {
    await downloadCV()
  }
      
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-cyan-500/30 rounded-full blur-2xl animate-bounce delay-2000"></div>
      </div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_70%,transparent_110%)]" />
      
      <Section>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
            <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200 leading-tight">
              Curriculum Vitae
            </h1>
            <button 
              onClick={onDownloadClick}
              className="
                border border-white/20
                bg-white/10
                backdrop-blur-xl
                rounded-xl sm:rounded-2xl
                px-4 sm:px-6 py-2 sm:py-3
                flex items-center
                hover:bg-white/20
                hover:border-white/30
                transition-all duration-300
                text-white
                font-medium
                shadow-lg
                hover:shadow-blue-500/20
                group
                cursor-pointer
                w-full sm:w-auto
                justify-center sm:justify-start
              "
            >
              <span className="mr-2.5 group-hover:text-blue-200 transition-colors text-sm sm:text-base">Download</span>
              <FcDownload className="text-white group-hover:scale-110 transition-transform w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto mt-8 sm:mt-10 px-4 sm:px-6">
          <div className="flex flex-col space-y-6 sm:space-y-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/20">
              <div className="flex flex-row items-center space-x-3 sm:space-x-4" id="experiences">
                <p className="font-bold text-lg sm:text-xl text-white tracking-[0.2em] sm:tracking-[0.3em]">
                  EXPERIENCES
                </p>
                <div className="h-[2px] sm:h-[3px] w-[35px] sm:w-[45px] bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
              </div>
            </div>

            <div className="relative space-y-4 sm:space-y-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              {data?.map(item => (
                <Timeline
                key={item.id}
                dateText={`${format(item.startDate, 'MMM yyyy')} - ${item.endDate ? format(item.endDate ?? '', 'MMM yyyy') : 'recently'}`}
                bgCard={generateRandomLightColor()}
              >
                <p className="font-bold text-white text-base sm:text-lg leading-tight">{item.company} - {item.position}</p>
                {item.description?.map(desc => (
                  <p key={desc} className="text-blue-100/80 leading-relaxed text-sm sm:text-base mt-2">{desc}</p>
                ))}
              </Timeline>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Education />
      <Certification />
      <Stacks />
    </div>
  );
}