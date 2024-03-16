"use client";

import React from "react";
import ProjectNavbar from "~/components/core/project/project-navbar";

import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

export default function Page({
  params,
}: {
  params: { orgId: string; projectId: string };
}) {
  const repo = api.github.getRepoById.useQuery({
    owner: params.orgId,
    repo: params.projectId,
  });

  if (repo.isLoading) {
    return <div>Is loading</div>;
  }

  return (
    <div>
      <ProjectNavbar
        projectName={params.projectId}
        orgName={params.orgId}
      ></ProjectNavbar>
      <div className="min-h-screen bg-[#111111] text-white">
        <header className="border-b border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">{repo.data?.repo.data.name}</h1>
            <div className="mt-2 flex space-x-4">
              <a target="_blank" href={repo.data?.repo.data.html_url}>
                <Button className="bg-white text-black" variant="default">
                  Git Repository
                </Button>
              </a>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <h2 className="text-2xl font-bold">Production Deployment</h2>
          <p className="mt-2 text-gray-400">
            The deployment that is available to your visitors.
          </p>
          <div className="mt-6 flex flex-col lg:flex-row lg:space-x-8">
            <div className="mt-6 w-full rounded-lg bg-black p-4 lg:mt-0 lg:w-1/2">
              <h3 className="mb-2 text-lg font-bold">Deployment</h3>
              <Link className="text-blue-400" href="#">
                indudancers-frontend-eqf9be0hh-web3homeless.vercel.app
              </Link>
              <div className="mt-2 flex items-center">
                <Link className="text-blue-400" href="#">
                  indudancers-frontend.vercel.app
                </Link>
                <Badge className="ml-2" variant="secondary">
                  +2
                </Badge>
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-bold">Domains</h4>
                <p className="text-gray-400">indudancers-frontend.vercel.app</p>
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-bold">Status</h4>
                <div className="flex items-center">
                  <Badge className="bg-green-600" variant="secondary">
                    Ready
                  </Badge>
                  <p className="ml-2 text-gray-400">
                    Created 97d ago by MadLime
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-bold">Source</h4>
                <div className="flex items-center">
                  <GitBranchIcon className="text-gray-400" />
                  <p className="ml-2 text-gray-400">main</p>
                </div>
                <div className="mt-2 flex items-center">
                  <GitCommitIcon className="text-gray-400" />
                  <p className="ml-2 text-gray-400">134dfdf Update README.md</p>
                </div>
              </div>
              <div className="mt-4 flex space-x-4">
                <Button variant="outline">Build Logs</Button>
                <Button variant="outline">Runtime Logs</Button>
                <Button variant="outline">Instant Rollback</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function GitBranchIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" x2="6" y1="3" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function GitCommitIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <line x1="3" x2="9" y1="12" y2="12" />
      <line x1="15" x2="21" y1="12" y2="12" />
    </svg>
  );
}
