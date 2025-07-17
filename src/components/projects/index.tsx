"use client";
import { AiOutlineMobile } from "react-icons/ai";
import { TbWorld } from "react-icons/tb";
import type { Project } from "@/shared";
import { useRouter } from "next/navigation";
import usePassDetailStore from "@/stores/pass-detail-store";
import { useGetProjects } from "@/services/projects";
import { Section } from "../section";
import { useProjects } from "@/hooks/useProjects";
import useSelectedTabStore from "@/stores/selected-tab-store";
import { Skeleton } from "../ui/skeleton";

export function Projects() {
  const router = useRouter();
  const { selectedTab, setSelectedTab } = useSelectedTabStore();

  const { data: mobileData, isLoading: isLoadMobile } =
    useGetProjects("mobile");
  const { data: websiteData, isLoading: isLoadWebsite } =
    useGetProjects("website");

  const setData = usePassDetailStore((state) => state.setData);

  console.log("mobileData", mobileData);
  console.log("websiteData", websiteData);

  const onNavigate = (data: Project) => {
    setData(data);
    router.push("/projects/detail");
  };

  const currentData = selectedTab === "mobile" ? mobileData : websiteData;

  return (
    <div>
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col space-y-5">
            <h1 className="text-center font-bold text-4xl">Projects</h1>

            {/* Tab Selector */}
            <div className="w-3/4 self-center rounded shadow-[0_7px_29px_0_rgba(100,100,111,0.2)]">
              <div className="flex flex-row items-center relative justify-around">
                {/* Mobile Tab */}
                <div
                  className={`
                    flex-1 flex flex-row items-center justify-center 
                    rounded-tl rounded-bl cursor-pointer h-10 font-semibold
                    ${
                      selectedTab === "mobile"
                        ? "bg-blue-900/30 text-black"
                        : "bg-gray-200"
                    }
                  `}
                  onClick={() => setSelectedTab("mobile")}
                >
                  <AiOutlineMobile
                    className={
                      selectedTab === "mobile" ? "text-black" : "text-gray-500"
                    }
                  />
                  <span
                    className={`hidden md:flex ml-2 ${
                      selectedTab === "mobile" ? "text-black" : "text-gray-500"
                    }`}
                  >
                    Mobile Application
                  </span>
                </div>

                {/* Divider */}
                <div className="w-px h-7 bg-blue-200"></div>

                {/* Web Tab */}
                <div
                  className={`
                    flex-1 flex flex-row items-center justify-center 
                    rounded-tr rounded-br cursor-pointer h-10
                    ${
                      selectedTab === "website"
                        ? "bg-blue-900/30 text-black"
                        : "bg-gray-200"
                    }
                  `}
                  onClick={() => setSelectedTab("website")}
                >
                  <TbWorld
                    className={
                      selectedTab === "website" ? "text-black" : "text-gray-500"
                    }
                  />
                  <span
                    className={`hidden md:flex ml-2 ${
                      selectedTab === "website" ? "text-black" : "text-gray-500"
                    }`}
                  >
                    Web Application
                  </span>
                </div>
              </div>
            </div>

            {isLoadMobile ||
              (isLoadWebsite && (
                <div
                  className={
                    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 "
                  }
                >
                  {Array(9)
                    .fill("")
                    .map((_, i) => (
                      <Skeleton
                        key={i}
                        className="w-full h-[200px] rounded-lg px-2.5 py-5"
                      />
                    ))}
                </div>
              ))}

            {/* Projects Grid */}
            {!isLoadMobile && !isLoadWebsite && currentData && (
              <div
                className={
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 "
                }
              >
                {currentData?.map((o: Project) => (
                  <div
                    key={o.id}
                    className="px-2.5 py-5"
                    onClick={() => onNavigate(o)}
                  >
                    <div className="flex flex-col space-y-3 rounded-lg bg-[#1e3f66] cursor-pointer hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.8)] transition-shadow">
                      <div className="w-full h-[100px]">
                        <img
                          src={o.display}
                          alt="image"
                          className="object-cover object-center w-full h-full overflow-hidden rounded-t-lg"
                        />
                      </div>
                      <div className="pt-1 pb-2.5 px-2.5">
                        <div className="flex flex-col space-y-2">
                          <div className="flex flex-row items-center justify-between">
                            <div className="flex-1">
                              <p className="text-white font-semibold truncate">
                                {o.project_name}
                              </p>
                            </div>
                            {o.platform === "mobile" ? (
                              <AiOutlineMobile className="text-white" />
                            ) : (
                              <TbWorld className="text-white" />
                            )}
                          </div>
                          <div className="w-full h-px bg-white"></div>
                          <div className="flex flex-row justify-between items-center">
                            <p className="text-white text-xs text-center">
                              {o.year}
                            </p>
                            <div
                              onClick={() => onNavigate(o)}
                              className="text-white border border-white rounded-full py-1 px-5 text-xs text-center hover:bg-white hover:text-black transition-colors"
                            >
                              Detail
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
