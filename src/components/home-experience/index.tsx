"use client";
import { useGetExperiences } from "@/services/experiences";
import { generateRandomLightColor } from "../../utils/color";
import { Section } from "../section";
import { Timeline } from "../timeline";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Experience } from "@/shared";

export function HomeExperience() {
  const router = useRouter();
  const { data } = useGetExperiences();
  return (
    <div className="bg-white">
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col space-y-5">
            <div className="flex flex-row items-center space-x-4">
              <p className="font-bold text-base tracking-[0.3em]">
                EXPERIENCES
              </p>
              <div className="h-[3px] w-[45px] bg-black" />
            </div>

            <div className="relative flex-col space-y-4">
              {data &&
                data.slice(0, 2).map((item: Experience) => (
                  <Timeline
                    key={item.id}
                    dateText={`${format(item.startDate, "MMM yyyy")} ${
                      item.endDate && format(item?.endDate, "MMM yyyy")
                    } `}
                    bgCard={generateRandomLightColor()}
                  >
                    <p className="font-bold">
                      {item.company} - {item.position}
                    </p>
                    {item.description.map((value) => (
                      <p key={value}>{value}</p>
                    ))}
                  </Timeline>
                ))}

              <div className="flex flex-row gap-5 items-center justify-center max-w-4xl bg-white/90 py-5mx-auto">
                <div
                  className="bg-black px-5 py-2.5 rounded-lg cursor-pointer hover:shadow-[0_20px_30px_-10px_rgba(38,57,77,1)] transition-shado"
                  onClick={() => router.push("/cv#experiences")}
                >
                  <span className="text-white text-xs">View More</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
