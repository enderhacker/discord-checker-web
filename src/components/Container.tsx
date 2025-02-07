import type { PropsWithChildren } from "react";
import clsx from "clsx";

type ContainerProps = {
  className?: string;
};

const Container: React.FC<PropsWithChildren<ContainerProps>> = ({
  children,
  className,
}) => {
  return (
    <div className={clsx("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
};
export default Container;
