"use client";

import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";
import NavAvatar from "./nav-avatar";

type Props = {
  orgName: string;
  projectName: string;
};

export default function UpperNavbar({ orgName, projectName }: Props) {
  const session = useSession();

  return (
    <div className="flex items-center justify-between border-b border-gray-700 bg-black px-6 py-4">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <div className="flex gap-4 text-white">
          {/* Logo and project name here */}
          <span className="mr-5 font-bold">Logo</span>
          <Link className="font-bold" href={`/org/${orgName}`}>
            {orgName}
          </Link>
          <span className="font-bold">/</span>{" "}
          <Link
            className="font-bold"
            href={`org/${orgName}/project/${projectName}`}
          >
            {projectName}
          </Link>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Icons or links here */}
        <button className="text-gray-300">Feedback</button>
        <button className="text-gray-300">Changelog</button>
        <button className="text-gray-300">Help</button>
        <button className="text-gray-300">Docs</button>
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
