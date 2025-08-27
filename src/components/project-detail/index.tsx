'use client'
import { BiChevronLeft } from "react-icons/bi";
import Slider from "react-slick";
import { AiFillApple } from "react-icons/ai";
import { TbWorld } from "react-icons/tb";
import { FaGooglePlay } from "react-icons/fa";
import { Section } from "../section";
import type { Project } from "@/shared";
import { useRouter } from "next/navigation";
import usePassDetailStore, { initialPassDataState } from "@/stores/pass-detail-store";
import Link from 'next/link'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export function ProjectDetail({
  data,
  imageData,
}: {
  data: Project;
  imageData: Array<string>;
}) {
  const router = useRouter()
  const setData = usePassDetailStore(state => state.setData)

  const imageSettings = {
    dots: true,
    infinite: imageData?.length > 3,
    arrows: true,
    autoplay: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const imageMSettings = {
    dots: true,
    infinite: imageData?.length > 3,
    arrows: true,
    autoplay: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
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

  const onBack = () => {
    setData(initialPassDataState)
    router.back()
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
          <div className="flex flex-col space-y-8">
            {/* Header Section */}
            <div className="flex flex-row justify-between items-center">
              <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                {data?.project_name}
              </h1>
              <div
                onClick={onBack}
                className="border border-white/20 bg-white/10 backdrop-blur-xl cursor-pointer rounded-2xl px-4 py-3 bg-white/5 flex items-center hover:bg-white/20 hover:border-white/30 transition-all duration-300 group"
              >
                <BiChevronLeft className="text-white group-hover:text-blue-200 transition-colors" />
                <span className="ml-2.5 text-white group-hover:text-blue-200 transition-colors font-medium">Back</span>
              </div>
            </div>

            {/* Metadata Section */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/20">
              <div className="flex flex-row items-center space-x-6">
                <div className="flex flex-col">
                  <span className="font-bold text-white text-lg">Date</span>
                  <span className="text-blue-200/80">{data?.year}</span>
                </div>
                <div className="h-12 w-px bg-gradient-to-b from-blue-400/50 to-purple-400/50"></div>
                <div className="flex flex-col">
                  <span className="font-bold text-white text-lg">Platform</span>
                  <span className="text-blue-200/80 capitalize">
                    {data?.platform}
                  </span>
                </div>
                <div className="h-12 w-px bg-gradient-to-b from-blue-400/50 to-purple-400/50"></div>
                <div className="flex flex-col">
                  <span className="font-bold text-white text-lg">Tech</span>
                  <span className="text-blue-200/80">{data?.tag}</span>
                </div>
              </div>
            </div>

            {/* Image Sliders */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              {data?.platform === "website" && (
                <Slider {...imageSettings}>
                  {imageData && imageData.map((o, i) => (
                    <div key={i} className="flex justify-center items-center">
                      <img
                        src={o}
                        alt={data?.project_name}
                        className="w-full h-full rounded-xl object-cover shadow-lg"
                      />
                    </div>
                  ))}
                </Slider>
              )}

              {data?.platform === "mobile" && (
                <Slider {...imageMSettings}>
                  {imageData && imageData.map((o, i) => (
                    <div key={i} className="p-7 flex justify-center items-center">
                      <img
                        src={o}
                        alt={data?.project_name}
                        className="rounded-xl w-full h-auto shadow-lg"
                      />
                    </div>
                  ))}
                </Slider>
              )}
            </div>

            {/* Description Section */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/20">
              <div className="flex flex-col space-y-4">
                <h2 className="font-bold text-2xl text-white">Description</h2>
                <p className="text-blue-100/90 leading-relaxed text-lg">{typeof data.description === 'string' ? data.description : data?.description?.map((item: string) => item)}</p>
              </div>
            </div>

            {/* Available On Section */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/20">
              <div className="flex flex-col space-y-4">
                <h2 className="font-bold text-2xl text-white">Available on</h2>
                {data?.platform === "website" && data?.link_website !== "" && (
                  <Link
                    href={data?.link_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-3xl text-blue-300 hover:text-cyan-300 transition-colors hover:scale-110 transform duration-300 inline-block"
                  >
                    <TbWorld />
                  </Link>
                )}

                {data?.platform === "mobile" && (
                  <div className="flex flex-row items-center space-x-6">
                    {data?.link_appstore !== "" && (
                      <div className="flex flex-row items-center space-x-6">
                        <Link
                          href={data?.link_appstore}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-3xl text-blue-300 hover:text-cyan-300 transition-colors hover:scale-110 transform duration-300 inline-block"
                        >
                          <AiFillApple />
                        </Link>
                        <div className="h-6 w-px bg-gradient-to-b from-blue-400/50 to-purple-400/50"></div>
                      </div>
                    )}
                    {data?.link_playstore !== "" && (
                      <div className="flex flex-row items-center space-x-6">
                        <Link
                          href={data?.link_playstore}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-3xl text-blue-300 hover:text-cyan-300 transition-colors hover:scale-110 transform duration-300 inline-block"
                        >
                          <FaGooglePlay />
                        </Link>
                        <div className="h-6 w-px bg-gradient-to-b from-blue-400/50 to-purple-400/50"></div>
                      </div>
                    )}
                    {data?.link_website !== "" && (
                      <Link
                        href={data?.link_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-3xl text-blue-300 hover:text-cyan-300 transition-colors hover:scale-110 transform duration-300 inline-block"
                      >
                        <TbWorld />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
