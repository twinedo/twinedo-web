
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
    <div className="bg-white">
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[48px]">
              Curriculum Vitae
            </h1>
            <button 
              onClick={onDownloadClick}
              className="
                border border-gray-300
                rounded-md
                px-4 py-2
                flex items-center
                hover:bg-gray-50
                transition-colors
              "
            >
              <span className="mr-2.5">Download</span>
              <FcDownload />
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-7">
          <div className="flex flex-col space-y-5">
            <div className="flex flex-row items-center space-x-4" id="experiences">
              <p className="font-bold text-base tracking-[0.3em]">
                EXPERIENCES
              </p>
              <div className="h-[3px] w-[45px] bg-black" />
            </div>

            <div className="relative space-y-5">
              {data?.map(item => (
                <Timeline
                key={item.id}
                dateText={`${format(item.startDate, 'MMM yyyy')} - ${item.endDate ? format(item.endDate ?? '', 'MMM yyyy') : 'recently'}`}
                bgCard={generateRandomLightColor()}
              >
                <p className="font-bold">{item.company} - {item.position}</p>
                {item.description?.map(desc => (
                  <p key={desc}>{desc}</p>
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