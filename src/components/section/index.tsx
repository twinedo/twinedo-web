import type { ReactNode } from 'react';

interface ISection {
  children: ReactNode;
  className?: string;
}

export function Section(props: ISection) {
  const { children, className = '' } = props;
  return (
    <div className={`pt-[100px] pb-[50px] px-0 ${className}`}>
      {children}
    </div>
  );
}