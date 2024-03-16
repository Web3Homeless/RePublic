import React from "react";
import OrgNavbar from "~/components/core/organisation/org-navbar";
import ProjectCollection from "~/components/core/project/project-collection";
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
      <ProjectCollection></ProjectCollection>
      <div></div>
    </div>
  );
}
