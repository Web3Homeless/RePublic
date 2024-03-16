"use client";

import React, { useEffect, useState } from "react";
import ProjectNavbar from "~/components/core/project/project-navbar";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { trpc } from "/utils/trpc";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DEPLOYMENT_TARGETS } from "~/lib/shared";
import { useToast } from "~/components/ui/use-toast";

export default function Page({
  params,
}: {
  params: { orgId: string; projectId: string };
}) {
  const utils = api.useUtils();

  const mapSettings = api.settings.getAllSettings.useQuery({
    projectId: params.projectId,
  });

  const createMapMutation = api.settings.createNewMapping.useMutation({
    onSuccess: async () => {
      console.log("CREATED MAPPING");
      await utils.settings.invalidate();
    },
  });

  console.log(mapSettings.data);

  const components = mapSettings.data?.settings.map((x) => {
    return (
      <MapComponent
        key={x.id}
        id={x.id}
        branch={x.branch}
        deploymentTargetId={x.deployTarget}
        isCreated={true}
        projectId={x.project_id}
      ></MapComponent>
    );
  });

  function onCreateButtonClick() {
    createMapMutation.mutate({
      branch: "",
      deployTarget: "",
      projectId: params.projectId,
    });
  }

  return (
    <div>
      <ProjectNavbar
        projectName={params.projectId}
        orgName={params.orgId}
      ></ProjectNavbar>
      <div className="space-y-4 px-28 py-10">
        <h1>Setup your branch mapping</h1>
        {/* <MapComponent></MapComponent> */}
        {components}
        <Button
          onClick={() => onCreateButtonClick()}
          className="w-full"
          variant="outline"
        >
          Create new mapping
        </Button>
      </div>
    </div>
  );
}

type MapProps = {
  id: string;
  projectId: string;
  isCreated: boolean;
  branch: string;
  deploymentTargetId: string;
};

function MapComponent({ id, branch, isCreated, deploymentTargetId }: MapProps) {
  const utils = api.useUtils();
  const { toast } = useToast();

  const deleteMapMutation = api.settings.deleteMapping.useMutation({
    onSuccess: async () => {
      await utils.settings.invalidate();
      toast({
        title: "Scheduled: Catch up",
        description: "Friday, February 10, 2023 at 5:57 PM",
      });
    },
  });
  const updateMapMutation = api.settings.updateMapping.useMutation({
    onSuccess: async () => {
      await utils.settings.invalidate();
    },
  });

  const [branchState, setBranch] = useState(branch);
  const [deployState, setDeploy] = useState(deploymentTargetId);

  const isMapCreated = isCreated;

  const targets = Object.entries(DEPLOYMENT_TARGETS).map((x) => {
    return (
      <SelectItem key={x[1]} value={x[1]}>
        {x[0]}
      </SelectItem>
    );
  });

  function onSelectChange(value: string) {
    setDeploy(value);
    toast({
      title: "Scheduled: Catch up",
      description: "Friday, February 10, 2023 at 5:57 PM",
    });
  }

  function onBranchChange(value: string) {
    console.log("UPDATE BRAHCNH", value);
    setBranch(value);
  }

  function onDeleteClick() {
    deleteMapMutation.mutate({
      mappingId: id,
    });
  }

  function onSaveClick() {
    updateMapMutation.mutate({
      branch: branchState,
      mappingId: id,
      deployTarget: deployState,
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="space-y-1">
        <Label className="flex flex-col" htmlFor="first-source-column">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Target Branch
          </span>
          <Input
            id="first-source-column"
            placeholder="e.g. master"
            defaultValue={branch}
            onChange={(v) => onBranchChange(v.target.value)}
          />
        </Label>
      </div>
      <div className="space-y-1">
        <Label className="flex flex-col" htmlFor="first-target-column">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Deployment Target
          </span>
          <Select
            defaultValue={deploymentTargetId}
            onValueChange={(v) => onSelectChange(v)}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>{targets}</SelectContent>
          </Select>
        </Label>
      </div>
      <div className="flex items-end gap-5 space-y-1">
        <Button onClick={() => onSaveClick()}>Save</Button>
        <Button variant={"destructive"} onClick={() => onDeleteClick()}>
          Delete
        </Button>
      </div>
    </div>
  );
}
