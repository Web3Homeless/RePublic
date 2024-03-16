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
      <Component></Component>
    </div>
  );
}

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/X7I8ZiiVJaY
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

export function Component() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex flex-col" htmlFor="first-source-column">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              First source column
            </span>
            <Input id="first-source-column" placeholder="e.g. A" />
          </Label>
          <Label className="flex flex-col" htmlFor="second-source-column">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Second source column
            </span>
            <Input id="second-source-column" placeholder="e.g. B" />
          </Label>
        </div>
        <div className="space-y-2">
          <Label className="flex flex-col" htmlFor="first-target-column">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              First target column
            </span>
            <Input id="first-target-column" placeholder="e.g. C" />
          </Label>
          <Label className="flex flex-col" htmlFor="second-target-column">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Second target column
            </span>
            <Input id="second-target-column" placeholder="e.g. D" />
          </Label>
        </div>
      </div>
      <Button className="w-full" variant="outline">
        Create mapping
      </Button>
    </div>
  );
}
