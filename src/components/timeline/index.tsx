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
    <div className={`flex flex-col md:flex-row gap-2 md:gap-5 ${className}`}>
      <div className="flex flex-1">
        <p className="text-blue-200/80 font-medium">{dateText}</p>
      </div>
      <div className="flex flex-[2]">
        <div className="
          border-l-0
          md:border-l-2
          md:border-l-blue-400/50
          pl-0
          md:pl-[30px]
          mb-[30px]
          md:mb-0
        ">
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}