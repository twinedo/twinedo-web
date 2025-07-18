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
  // console.log('imageData', imageData)

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
    <div className="bg-white">
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col space-y-5">
            {/* Header Section */}
            <div className="flex flex-row justify-between items-center">
              <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl">
                {data?.project_name}
              </h1>
              <div
                onClick={onBack}
                className="border cursor-pointer border-gray-300 rounded-md px-3 py-1.5 bg-white flex items-center hover:bg-gray-50 transition-colors"
              >
                <BiChevronLeft />
                <span className="ml-2.5">Back</span>
              </div>
            </div>

            {/* Metadata Section */}
            <div className="flex flex-row items-center space-x-4">
              <div className="flex flex-col">
                <span className="font-bold">Date</span>
                <span className="text-gray-500">{data?.year}</span>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div className="flex flex-col">
                <span className="font-bold">Platform</span>
                <span className="text-gray-500 capitalize">
                  {data?.platform}
                </span>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div className="flex flex-col">
                <span className="font-bold">Tech</span>
                <span className="text-gray-500">{data?.tag}</span>
              </div>
            </div>

            {/* Image Sliders */}
            {data?.platform === "website" && (
              <Slider {...imageSettings}>
                {imageData && imageData.map((o, i) => (
                  <div key={i} className="flex justify-center items-center">
                    <img
                      src={o}
                      alt={data?.project_name}
                      className="w-full h-full rounded-lg object-cover"
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
                      className="rounded-lg w-full h-auto"
                    />
                  </div>
                ))}
              </Slider>
            )}

            {/* Description Section */}
            <div className="flex flex-col space-y-2">
              <h2 className="font-bold">Description</h2>
              <p>{data?.description[0]}</p>
            </div>

            {/* Available On Section */}
            <div className="flex flex-col space-y-2">
              <h2 className="font-bold">Available on</h2>
              {data?.platform === "website" && data?.link_website !== "" && (
                <Link
                  href={data?.link_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl"
                >
                  <TbWorld />
                </Link>
              )}

              {data?.platform === "mobile" && (
                <div className="flex flex-row items-center space-x-5">
                  {data?.link_appstore !== "" && (
                    <div className="flex flex-row items-center space-x-5">
                      <Link
                        href={data?.link_appstore}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl"
                      >
                        <AiFillApple />
                      </Link>
                      <div className="h-5 w-px bg-gray-300"></div>
                    </div>
                  )}
                  {data?.link_playstore !== "" && (
                    <div className="flex flex-row items-center space-x-5">
                      <Link
                        href={data?.link_playstore}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl"
                      >
                        <FaGooglePlay />
                      </Link>
                      <div className="h-5 w-px bg-gray-300"></div>
                    </div>
                  )}
                  {data?.link_website !== "" && (
                    <Link
                      href={data?.link_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-2xl"
                    >
                      <TbWorld />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
