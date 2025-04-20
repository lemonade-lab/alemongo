import classNames from "classnames";
import { PropsWithChildren } from "react";

const Modal = ({open, children}: {open: boolean} & PropsWithChildren) => {
  return (
    <div
      className={classNames(
        " bg-black bg-opacity-30 fixed top-0 left-0 w-full h-full z-30",
        {hidden: !open}
      )}
    >
      {children}
    </div>
  );
};

export default Modal;
