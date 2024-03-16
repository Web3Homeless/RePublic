"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import UpperNavbar from "../upper-navbar";

type Props = {
  orgName: string;
  projectName: string;
};

export default function ProjectNavbar({ orgName, projectName }: Props) {
  const pathName = usePathname();
  const baseUrl = `org/${orgName}/project/${projectName}`;

  const isActive = (pathname: string) =>
    "/" + baseUrl + "/" + pathname == pathName;

  const linkStyles = (pathname: string) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive(pathname) ? "text-red-500" : "text-gray-300 hover:text-white"}`;

  console.log(baseUrl);
  console.log(pathName);
  console.log(baseUrl + "/" + "deployments");
  console.log(isActive("deployments"));

  return (
    <div className="border-[0.5px]">
      {/* Top bar */}
      <UpperNavbar orgName={orgName} projectName={projectName}></UpperNavbar>

      {/* Subnavbar */}
      <div className="flex justify-start space-x-4 px-6 py-3">
        {/* Subnav items */}
        <Link href={`/${baseUrl}`} className={linkStyles("")}>
          Overview
        </Link>
        <Link
          href={`/${baseUrl}/deployments`}
          className={linkStyles("deployments")}
        >
          Deployments
        </Link>
        <Link href={`/${baseUrl}/logs`} className={linkStyles("logs")}>
          Logs
        </Link>
        <Link href={`/${baseUrl}/settings`} className={linkStyles("settings")}>
          Settings
        </Link>
        {/* ... other items ... */}
      </div>
    </div>
  );
}
