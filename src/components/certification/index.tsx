import { generateRandomLightColor } from "../../utils/color";
import { Section } from "../section";
import { Timeline } from "../timeline";


export function Certification() {
  return (
    <Section>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col space-y-5">
          <div className="flex flex-row items-center space-x-4">
            <p className="font-bold text-base tracking-[0.3em]">
              CERTIFICATIONS
            </p>
            <div className="h-[3px] w-[45px] bg-black" />
          </div>

          <Timeline dateText='Feb 2021' bgCard={generateRandomLightColor()}>
            <p className="font-bold">
              Belajar Membuat Aplikasi Flutter untuk Pemula
            </p>
            <p>Dicoding.com</p>
          </Timeline>
          
          <Timeline dateText='Jan 2020' bgCard={generateRandomLightColor()}>
            <p className="font-bold">Memulai Pemrograman Dengan Kotlin</p>
            <p>Dicoding.com</p>
          </Timeline>

          <Timeline dateText='Oct 2019' bgCard={generateRandomLightColor()}>
            <p className="font-bold">Belajar Fundamental Aplikasi Android</p>
            <p>Dicoding.com</p>
          </Timeline>

          <Timeline dateText='Jun 2019' bgCard={generateRandomLightColor()}>
            <p className="font-bold">
              Belajar Membuat Aplikasi Android untuk Pemula
            </p>
            <p>Dicoding.com</p>
          </Timeline>
        </div>
      </div>
    </Section>
  );
}