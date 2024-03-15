import React from "react";
import ProjectNavbar from "~/components/core/project/project-navbar";

export default function Page({
  params,
}: {
  params: { orgId: string; projectId: string };
}) {
  return (
    <div>
      <ProjectNavbar
        projectName={params.projectId}
        orgName={params.orgId}
      ></ProjectNavbar>
      Page on {params.orgId} and {params.projectId}
    </div>
  );
}
