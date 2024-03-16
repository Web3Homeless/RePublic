import React from "react";
import OrgNavbar from "~/components/core/organisation/org-navbar";

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
    </div>
  );
}
