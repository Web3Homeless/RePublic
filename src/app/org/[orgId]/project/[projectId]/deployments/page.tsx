"use client";

import React from "react";
import ProjectNavbar from "~/components/core/project/project-navbar";

import { Badge } from "~/components/ui/badge";
import Loader from "~/components/ui/loaders/loader";
import { api } from "~/trpc/react";

export default function Page({
  params,
}: {
  params: { orgId: string; projectId: string };
}) {
  const deployments = api.deployments.getAllDeployments.useQuery({
    repoName: params.projectId,
  });

  const deployComponents = !deployments.isLoading ? (
    deployments.data?.deployments.map((x) => {
      return (
        <DeploymentComponent
          id={x.id}
          key={x.id}
          branch={x.branch}
          details={x.details}
          lastUpdated={x.lastUpdated.toDateString()}
          status={x.status}
          env={x.environment}
          updatedBy={x.updatedBy}
        ></DeploymentComponent>
      );
    })
  ) : (
    <></>
  );

  return (
    <div>
      <ProjectNavbar
        projectName={params.projectId}
        orgName={params.orgId}
      ></ProjectNavbar>
      <div className="min-h-screen text-white">
        <header className="border-b p-10">
          <h1 className="text-3xl font-bold">Deployments</h1>
          <p className="mt-2 flex gap-2 text-gray-400">
            <FolderSyncIcon className="mr-2 inline text-gray-400" />
            Continuously generated from
            <GithubIcon className="ml-2 mr-2 inline text-gray-400" />
            {params.orgId}/{params.projectId}
          </p>
        </header>
        <div className="">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Environment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Updated By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              {deployments.isLoading ? (
                <Loader></Loader>
              ) : (
                <tbody className="divide-y">{deployComponents}</tbody>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

type DeploymentProps = {
  id: string;
  env: string;
  status: string;
  branch: string;
  lastUpdated: string;
  details: string;
  updatedBy: string;
};

function DeploymentComponent(props: DeploymentProps) {
  const query = api.deployments.getDeploymentStatus.useQuery(
    {
      deploymentId: props.id,
    },
    {
      refetchInterval: (data) =>
        data && data.status !== "success" ? 2000 : false,
    },
  );

  const currentStatus = query.data?.status || props.status;

  return (
    <tr className="">
      <td className="whitespace-nowrap px-6 py-4">{props.id}</td>
      <td className="whitespace-nowrap px-6 py-4">{props.env}</td>
      <td className="whitespace-nowrap px-6 py-4">
        {StatusToBadge(currentStatus)}
      </td>
      <td className="whitespace-nowrap px-6 py-4">{props.branch}</td>
      <td className="whitespace-nowrap px-6 py-4">{props.lastUpdated}</td>
      <td className="whitespace-nowrap px-6 py-4">{props.details}</td>
      <td className="whitespace-nowrap px-6 py-4">{props.updatedBy}</td>
      <td className="whitespace-nowrap px-6 py-4">
        <MoreVerticalIcon className="" />
      </td>
    </tr>
  );
}

function StatusToBadge(status: string) {
  if (status == "Error") {
    return (
      <Badge className="bg-red-500" variant="default">
        {status}
      </Badge>
    );
  }

  if (status == "Created") {
    return (
      <Badge className="bg-blue-500" variant="default">
        {status}
      </Badge>
    );
  }

  if (status == "Building") {
    return (
      <Badge className="bg-yellow-500" variant="default">
        {status}
      </Badge>
    );
  }

  if (status == "Success") {
    return (
      <Badge className="bg-green-500" variant="default">
        {status}
      </Badge>
    );
  }
}

function FolderSyncIcon(props) {
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
      <path d="M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v1" />
      <path d="M12 10v4h4" />
      <path d="m12 14 1.5-1.5c.9-.9 2.2-1.5 3.5-1.5s2.6.6 3.5 1.5c.4.4.8 1 1 1.5" />
      <path d="M22 22v-4h-4" />
      <path d="m22 18-1.5 1.5c-.9.9-2.1 1.5-3.5 1.5s-2.6-.6-3.5-1.5c-.4-.4-.8-1-1-1.5" />
    </svg>
  );
}

function GithubIcon(props) {
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
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function MoreVerticalIcon(props) {
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
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}
