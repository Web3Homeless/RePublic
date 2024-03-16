"use client";

import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";
import NavAvatar from "./nav-avatar";
import { Button } from "../ui/button";

type Props = {
  orgName: string;
  projectName: string;
};

export default function UpperNavbar({ orgName, projectName }: Props) {
  const session = useSession();

  return (
    <div className="flex items-center justify-between border-b px-6 py-4">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center gap-4 text-white">
          {/* Logo and project name here */}
          <span className="font mr-5 flex items-center font-extrabold">
            <Link href="/">
              <span className="text-red-500">RE:</span>{" "}
              <span className="hover:text-red-500">PUBLIC</span>
            </Link>
          </span>
          {orgName != null && orgName != "" && (
            <span className="flex items-center font-bold">/</span>
          )}
          <Link className="font-bold" href={`/org/${orgName}/projects`}>
            <Button className="px-1" variant={"link"}>
              {orgName}
            </Button>
          </Link>
          {projectName != null && projectName != "" && (
            <span className="flex items-center font-bold">/</span>
          )}
          <Link
            className="font-bold"
            href={`org/${orgName}/project/${projectName}`}
          >
            <Button className="px-1" variant={"link"}>
              {projectName}
            </Button>
          </Link>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5 space-x-4 pr-5">
        {/* Icons or links here */}
        <Button className="px-0" variant={"link"}>
          Feedback
        </Button>
        <Button className="px-0" variant={"link"}>
          Change Logs
        </Button>
        <Button className="px-0" variant={"link"}>
          Help
        </Button>
        <Button className="px-0" variant={"link"}>
          Docs
        </Button>
        {session.status == "unauthenticated" ? (
          <Link
            href="/api/auth/signin"
            className="rounded-full bg-white/10 px-5 py-2 font-semibold no-underline transition hover:bg-white/20"
          >
            Sign In
          </Link>
        ) : (
          <NavAvatar></NavAvatar>
        )}
        {/* Profile dropdown */}
      </div>
    </div>
  );
}
