'use client'
import Slider from "react-slick";
import { arrImages } from "../../utils/const";
import { Section } from "../section";

export function Stacks() {
  const settings = {
    dots: true,
    infinite: arrImages.length > 3,
    arrows: false,
    autoplay: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 5,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="bg-gray-500">
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col space-y-5 relative overflow-hidden">
            <div className="flex flex-row items-center space-x-4">
              <p className="font-bold text-base text-white tracking-[0.3em]">
                STACKS
              </p>
              <div className="h-[3px] w-[45px] bg-white" />
            </div>

            <Slider {...settings}>
              {arrImages.map((o) => (
                <div key={o.id} className="cursor-pointer mx-1">
                  <img
                    src={o.path}
                    alt={o.name}
                    className="
                      grayscale
                      hover:grayscale-0
                      transition-all
                      w-[50px] sm:w-[70px] md:w-[100px]
                    "
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </Section>
    </div>
  );
}
