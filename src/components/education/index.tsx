
import { generateRandomLightColor } from '../../utils/color';
import { Section } from '../section';
import { Timeline } from '../timeline';

export function Education() {
  return (
    <div className="relative bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-900/95">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <Section>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex flex-col space-y-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/20">
              <div className="flex flex-row items-center space-x-4">
                <p className="font-bold text-xl text-white tracking-[0.3em]">
                  EDUCATION
                </p>
                <div className="h-[3px] w-[45px] bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <Timeline
                dateText='2013 - 2017'
                bgCard={generateRandomLightColor()}
              >
                <p className="font-bold text-white text-lg">
                  Informatics Engineering - Gunadarma University
                </p>
                <p className="text-blue-100/80">Bachelor's degree graduate</p>
              </Timeline>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}