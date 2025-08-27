import { generateRandomLightColor } from "../../utils/color";
import { Section } from "../section";
import { Timeline } from "../timeline";


export function Certification() {
  return (
    <div className="relative bg-gradient-to-br from-slate-900/95 via-indigo-900/95 to-slate-900/95">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <Section>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex flex-col space-y-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/20">
              <div className="flex flex-row items-center space-x-4">
                <p className="font-bold text-xl text-white tracking-[0.3em]">
                  CERTIFICATIONS
                </p>
                <div className="h-[3px] w-[45px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
              <Timeline dateText='Feb 2021' bgCard={generateRandomLightColor()}>
                <p className="font-bold text-white text-lg">
                  Belajar Membuat Aplikasi Flutter untuk Pemula
                </p>
                <p className="text-blue-100/80">Dicoding.com</p>
              </Timeline>
              
              <Timeline dateText='Jan 2020' bgCard={generateRandomLightColor()}>
                <p className="font-bold text-white text-lg">Memulai Pemrograman Dengan Kotlin</p>
                <p className="text-blue-100/80">Dicoding.com</p>
              </Timeline>

              <Timeline dateText='Oct 2019' bgCard={generateRandomLightColor()}>
                <p className="font-bold text-white text-lg">Belajar Fundamental Aplikasi Android</p>
                <p className="text-blue-100/80">Dicoding.com</p>
              </Timeline>

              <Timeline dateText='Jun 2019' bgCard={generateRandomLightColor()}>
                <p className="font-bold text-white text-lg">
                  Belajar Membuat Aplikasi Android untuk Pemula
                </p>
                <p className="text-blue-100/80">Dicoding.com</p>
              </Timeline>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}