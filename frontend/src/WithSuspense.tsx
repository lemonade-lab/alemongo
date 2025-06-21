import {PropsWithChildren, Suspense} from "react";
import Loading from "./Loading";
export const WithSuspense = ({children}: PropsWithChildren) => {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
};
