import React, { useEffect } from "react";
import { ring2 } from "ldrs";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  size?: number;
};

export default function Loader(props: Props) {
  useEffect(() => {
    return ring2.register();
  }, []);

  return (
    <l-ring-2
      size={props.size ?? 40}
      stroke="5"
      stroke-length="0.25"
      bg-opacity="0.1"
      speed="0.8"
      color="white"
      {...props}
    ></l-ring-2>
  );
}
