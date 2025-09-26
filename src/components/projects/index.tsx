"use client";
import { AiOutlineMobile } from "react-icons/ai";
import { TbWorld } from "react-icons/tb";
import type { Project } from "@/shared";
import { useRouter } from "next/navigation";
import usePassDetailStore from "@/stores/pass-detail-store";
import { useGetProjects } from "@/services/projects";
import { Section } from "../section";
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

  const onNavigate = (data: Project) => {
    setData(data);
    router.push("/projects/detail");
  };

  const currentData = selectedTab === "mobile" ? mobileData : websiteData;

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
          <div className="flex flex-col space-y-5">
            <h1 className="text-center font-bold text-4xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200 mb-8">Projects</h1>

            {/* Tab Selector */}
            <div className="w-3/4 self-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/20">
              <div className="flex flex-row items-center relative justify-around">
                {/* Mobile Tab */}
                <div
                  className={`
                    flex-1 flex flex-row items-center justify-center 
                    rounded-l-2xl cursor-pointer h-12 font-semibold transition-all duration-300
                    ${
                      selectedTab === "mobile"
                        ? "bg-gradient-to-r from-blue-500/40 via-white/20 to-purple-500/40 text-white border-r border-white/20 backdrop-blur-xl shadow-inner"
                        : "bg-white/5 text-blue-100/70 hover:bg-white/10 hover:text-white"
                    }
                  `}
                  onClick={() => setSelectedTab("mobile")}
                >
                  <AiOutlineMobile
                    className={`text-xl ${
                      selectedTab === "mobile" ? "text-white" : "text-blue-200/60"
                    }`}
                  />
                  <span
                    className={`hidden md:flex ml-2 ${
                      selectedTab === "mobile" ? "text-white" : "text-blue-200/60"
                    }`}
                  >
                    Mobile Application
                  </span>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-white/20"></div>

                {/* Web Tab */}
                <div
                  className={`
                    flex-1 flex flex-row items-center justify-center 
                    rounded-r-2xl cursor-pointer h-12 font-semibold transition-all duration-300
                    ${
                      selectedTab === "website"
                        ? "bg-gradient-to-r from-blue-500/40 via-white/20 to-purple-500/40 text-white border-l border-white/20 backdrop-blur-xl shadow-inner"
                        : "bg-white/5 text-blue-100/70 hover:bg-white/10 hover:text-white"
                    }
                  `}
                  onClick={() => setSelectedTab("website")}
                >
                  <TbWorld
                    className={`text-xl ${
                      selectedTab === "website" ? "text-white" : "text-blue-200/60"
                    }`}
                  />
                  <span
                    className={`hidden md:flex ml-2 ${
                      selectedTab === "website" ? "text-white" : "text-blue-200/60"
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
                    <div className="group flex flex-col space-y-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 cursor-pointer hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-2">
                      <div className="w-full h-[100px]">
                        <img
                          src={o.display}
                          alt="image"
                          className="object-cover object-center w-full h-full overflow-hidden rounded-t-2xl group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="pt-1 pb-2.5 px-2.5">
                        <div className="flex flex-col space-y-2">
                          <div className="flex flex-row items-center justify-between">
                            <div className="flex flex-1">
                              <p className="text-white font-semibold truncate group-hover:text-blue-200 transition-colors">
                                {o.project_name}
                              </p>
                            </div>
                            {o.platform === "mobile" ? (
                              <AiOutlineMobile className="text-blue-300 group-hover:text-cyan-300 transition-colors" />
                            ) : (
                              <TbWorld className="text-blue-300 group-hover:text-cyan-300 transition-colors" />
                            )}
                          </div>
                          <div className="w-full h-px bg-gradient-to-r from-blue-400/30 via-white/20 to-purple-400/30"></div>
                          <div className="flex flex-row justify-between items-center">
                            <p className="text-blue-100/80 text-xs text-center group-hover:text-white transition-colors">
                              {o.year}
                            </p>
                            <div
                              onClick={() => onNavigate(o)}
                              className="text-white border border-white/30 bg-white/10 backdrop-blur-sm rounded-full py-1 px-5 text-xs text-center hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:border-transparent transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
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
