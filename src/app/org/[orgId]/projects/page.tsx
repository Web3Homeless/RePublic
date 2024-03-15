import React from "react";
import OrgNavbar from "~/components/core/organisation/org-navbar";
import ProjectNavbar from "~/components/core/project/project-navbar";

export default function Page({
  params,
}: {
  params: { orgId: string; projectId: string };
}) {
  return (
    <div>
      <OrgNavbar
        projectName={params.projectId}
        orgName={params.orgId}
      ></OrgNavbar>
      PROJECTS Page on {params.orgId} and {params.projectId}
      <div></div>
    </div>
  );
}
