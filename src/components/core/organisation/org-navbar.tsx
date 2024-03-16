"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import UpperNavbar from "../upper-navbar";

type Props = {
  orgName: string;
  projectName: string;
};

export default function OrgNavbar({ orgName, projectName }: Props) {
  const pathName = usePathname();
  const baseUrl = `org/${orgName}`;

  const isActive = (pathname: string) => "/" + baseUrl + pathname == pathName;

  const linkStyles = (pathname: string) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive(pathname) ? "text-red-500" : "text-gray-300 hover:text-white"}`;

  console.log(baseUrl);
  console.log(pathName);
  console.log(baseUrl + "/" + "deployments");
  console.log(isActive("deployments"));

  return (
    <div>
      <UpperNavbar orgName={orgName} projectName={projectName}></UpperNavbar>

      <div className="flex justify-start space-x-4 border-b px-6 py-3">
        <Link
          href={`/org/${orgName}/projects`}
          className={linkStyles("/projects")}
        >
          Projects
        </Link>
        <Link
          href={`/org/${orgName}/monitoring`}
          className={linkStyles("/monitoring")}
        >
          Monitoring
        </Link>
      </div>
    </div>
  );
}
