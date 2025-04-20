import {PropsWithChildren} from "react";
import classNames from "classnames";

type TagProps = {
  type:
    | "gray"
    | "red"
    | "yellow"
    | "green"
    | "blue"
    | "indigo"
    | "purple"
    | "pink";
};

const Tags = ({children, type}: PropsWithChildren<TagProps>) => {
  const tagClass = classNames(
    "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
    {
      "bg-gray-50 text-gray-600 ring-gray-500/10": type === "gray",
      "bg-red-50 text-red-700 ring-red-600/10": type === "red",
      "bg-yellow-50 text-yellow-800 ring-yellow-600/20": type === "yellow",
      "bg-green-50 text-green-700 ring-green-600/20": type === "green",
      "bg-blue-50 text-blue-700 ring-blue-700/10": type === "blue",
      "bg-indigo-50 text-indigo-700 ring-indigo-700/10": type === "indigo",
      "bg-purple-50 text-purple-700 ring-purple-700/10": type === "purple",
      "bg-pink-50 text-pink-700 ring-pink-700/10": type === "pink",
    }
  );

  return <span className={tagClass}>{children}</span>;
};

export default Tags;
