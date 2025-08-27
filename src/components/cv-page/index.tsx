
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
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200">
              Curriculum Vitae
            </h1>
            <button 
              onClick={onDownloadClick}
              className="
                border border-white/20
                bg-white/10
                backdrop-blur-xl
                rounded-2xl
                px-6 py-3
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
              "
            >
              <span className=" mr-2.5 group-hover:text-blue-200 transition-colors">Download</span>
              <FcDownload color="white" className="text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto mt-10">
          <div className="flex flex-col space-y-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/20">
              <div className="flex flex-row items-center space-x-4" id="experiences">
                <p className="font-bold text-xl text-white tracking-[0.3em]">
                  EXPERIENCES
                </p>
                <div className="h-[3px] w-[45px] bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
              </div>
            </div>

            <div className="relative space-y-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              {data?.map(item => (
                <Timeline
                key={item.id}
                dateText={`${format(item.startDate, 'MMM yyyy')} - ${item.endDate ? format(item.endDate ?? '', 'MMM yyyy') : 'recently'}`}
                bgCard={generateRandomLightColor()}
              >
                <p className="font-bold text-white text-lg">{item.company} - {item.position}</p>
                {item.description?.map(desc => (
                  <p key={desc} className="text-blue-100/80 leading-relaxed">{desc}</p>
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