import React from "react";

export default function Page({
  params,
}: {
  params: { orgId: string; projectId: string };
}) {
  return (
    <div>
      ORG Page on {params.orgId} and {params.projectId}
    </div>
  );
}
