"use client";

import React, { useRef, useState } from "react";
import { api } from "~/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import AppLoader from "~/components/common/app-loader";
import { useRouter } from "next/navigation";
import ProjectCard from "./project-card";
import Loader from "~/components/ui/loaders/loader";

type Props = {};

type Repo = {
  name: string;
  owner: string;
};

export default function ProjectCollection({}: Props) {
  const router = useRouter();

  const [selectedValue, setSelectedValue] = useState("");

  const handleSelectionChange = (value: string) => {
    setSelectedValue(value);
  };

  const { data, isLoading } =
    api.github.getAllReposWithInstallations.useQuery();

  const listProjQuery = api.project.listProjects.useQuery();

  const repos = data?.repos?.repositories.map((r) => (
    <SelectItem key={r.id} value={r.name}>
      {r.name}
    </SelectItem>
  ));

  const projects = listProjQuery.data?.projects.map((x) => {
    return <ProjectCard key={x.id} id={x.id} name={x.repoName}></ProjectCard>;
  });

  return (
    <div className="flex flex-row gap-5 px-10 py-5">
      <div className="flex flex-row gap-10">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Import project</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Let's create something awesome</DialogTitle>
              <DialogDescription>
                Make sure you're installed Github Application with correct
                permissions
              </DialogDescription>
            </DialogHeader>
            <Link href="https://github.com/apps/republic-eth/installations/new">
              <Button variant={"secondary"}>Install Github App</Button>
            </Link>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Repository
                </Label>
                <Select onValueChange={(val) => handleSelectionChange(val)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>{repos}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex items-center justify-center">
              {isLoading ? (
                <AppLoader></AppLoader>
              ) : (
                <Button
                  type="submit"
                  className="w-full"
                  onClick={() => {
                    console.log(selectedValue);
                    const repo = data?.repos?.repositories.find((x) => {
                      console.log("AFAFAFAFAF", x);
                      console.log(selectedValue);
                      console.log(x.name === selectedValue);
                      return x.name === selectedValue;
                    });
                    console.log(repo);
                    console.log(data?.repos?.repositories);
                    router.push(
                      `import?repo=${selectedValue}&owner=${repo?.owner.login}`,
                    );
                  }}
                >
                  Import Github Project
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {!isLoading && projects}
      {isLoading && <Loader></Loader>}
    </div>
  );
}
