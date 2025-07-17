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
      <div className="flex-1">
        <p>{dateText}</p>
      </div>
      <div className="flex-4">
        <div className="
          border-l-0
          md:border-l-2
          md:border-l-gray-500
          pl-0
          md:pl-[30px]
          mb-[30px]
          md:mb-0
        ">
          <div className={`p-5 rounded-[20px]`} style={{ backgroundColor: bgCard }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}