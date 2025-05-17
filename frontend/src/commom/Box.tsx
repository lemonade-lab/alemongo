import classNames from "classnames";
import { PropsWithChildren } from "react";

/**
 * 自由滚动的盒子
 * @param param
 * @returns
 */
const Box = ({
  children,
  className,
}: PropsWithChildren<{
  className?: string;
}>) => {
  return (
    <div className="flex-1 flex overflow-auto bg-slate-100 dark:bg-zinc-900 transition-colors ">
      <div className="flex-1 flex w-[100px]">
        <div className={classNames(className, "flex-1 flex flex-col")}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Box;