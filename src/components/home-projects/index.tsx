'use client'
import Slider from "react-slick";
import { BiChevronRight } from "react-icons/bi";
import { AiOutlineMobile } from "react-icons/ai";
import { TbWorld } from "react-icons/tb";
import { Section } from "../section";
import type { Project } from "@/shared";
import { useGetProjects } from "../../services/projects";
import { useRouter } from "next/navigation";
import usePassDetailStore from "@/stores/pass-detail-store";

export function HomeProjects() {
  const router = useRouter()
  const { data: dataList } = useGetProjects("mobile");
  const setData = usePassDetailStore(state => state.setData)


  const settings = {
    dots: true,
    infinite: dataList && dataList?.length > 3,
    arrows: false,
    autoplay: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const onNavigate = (data: Project) => {
    setData(data)
    router.push("/projects/detail");
  };

  return (
    <Section className="bg-[#192841] w-full">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col space-y-5">
          <div className="flex flex-row items-center justify-between space-x-4">
            <div className="flex flex-row items-center space-x-4">
              <p className="text-white font-bold text-base tracking-[0.3em]">
                PROJECTS
              </p>
              <div className="h-[3px] w-[45px] bg-white" />
            </div>
            <div
              onClick={() => router.push("/projects")}
              className="flex flex-row items-center hover:text-yellow-300"
            >
              <p className="text-white text-xs font-semibold cursor-pointer">
                View More
              </p>
              <BiChevronRight className="text-white text-xl" />
            </div>
          </div>

          <div className="overflow-hidden w-full">
            <Slider {...settings}>
              {dataList &&
                dataList.slice(0, 4).map((o: Project) => (
                  <div
                    key={o.key}
                    className="px-2.5 py-5"
                    onClick={() => onNavigate(o)}
                  >
                    <div className="flex flex-col space-y-3 rounded-lg bg-[#1e3f66] cursor-pointer hover:shadow-[0_2px_8px_0_rgba(255,255,255,0.8)]">
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
                          <div className="w-full h-px bg-white" />
                          <div className="flex flex-row justify-between items-center">
                            <p className="text-white text-xs text-center">
                              {o.year}
                            </p>
                            <p
                              onClick={() => onNavigate(o)}
                              className="text-white border border-white rounded-full py-1 px-5 text-xs text-center hover:bg-white hover:text-black"
                            >
                              Detail
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </Slider>
          </div>
        </div>
      </div>
    </Section>
  );
}
