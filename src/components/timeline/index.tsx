import type { ReactNode } from "react";

interface IProps {
  bgCard: string;
  children: ReactNode;
  dateText: string;
  className?: string;
}

export function Timeline(props: IProps) {
  const { bgCard, children, dateText, className = "" } = props;

  return (
    <div className={`flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-5 ${className}`}>
      <div className="flex flex-1">
        <p className="text-blue-200/80 font-medium text-sm sm:text-base">{dateText}</p>
      </div>
      <div className="flex flex-[2]">
        <div className="
          border-l-0
          md:border-l-2
          md:border-l-blue-400/50
          pl-0
          md:pl-[30px]
          mb-[20px]
          sm:mb-[30px]
          md:mb-0
          w-full
        ">
          <div
            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300"
            style={{ backgroundColor: bgCard }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
