"use client";

import {
  CardTitle,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
  Select,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import OrgNavbar from "~/components/core/organisation/org-navbar";
import UpperNavbar from "~/components/core/upper-navbar";
import AppLoader from "~/components/common/app-loader";
import Link from "next/link";
import { GitBranchPlus, GitCommit } from "lucide-react";

export default function Page({
  params,
}: {
  params: { orgId: string; projectId: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const repoName = searchParams.get("repo")! as string;
  const repoOwner = searchParams.get("owner")! as string;

  const utils = api.useUtils();

  const { data: repoData, isLoading: repoLoading } =
    api.github.getRepoById.useQuery({
      repo: repoName,
      owner: repoOwner,
    });

  const { data, isLoading } =
    api.github.getAllReposWithInstallations.useQuery();

  const createProjectMutation = api.project.createProject.useMutation();

  console.log("repodata", repoData);
  console.log("data", data);

  const onDeployClick = async () => {
    createProjectMutation.mutate({
      owner: repoOwner,
      repo: repoName,
    });

    utils;
    await utils.project.invalidate();
    router.push(`/org/${params.orgId}/projects`);
  };

  return (
    <div>
      <UpperNavbar orgName={params.orgId} projectName=""></UpperNavbar>
      <div className="min-h-screen bg-[#121212] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <Link href={`/org/${params.orgId}/projects`}>
            <div className="mb-8 flex items-center">
              <ChevronLeftIcon className="h-6 w-6 text-gray-400" />
              <span className="ml-2 text-sm">Back</span>
            </div>
          </Link>

          <h1 className="mb-2 text-3xl font-bold">You're almost done.</h1>
          <p className="mb-8 text-gray-400">
            Please follow the steps to configure your Project and deploy it.
          </p>
          {repoLoading ? (
            <AppLoader></AppLoader>
          ) : (
            <div className="flex">
              <div className="w-64 pr-8">
                <div className="mb-4 flex items-center">
                  <GlobeIcon className="h-8 w-8 text-gray-400" />
                  <span className="ml-2">Next big thing</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-white" />
                    <span>Configure Project</span>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-gray-600" />
                    <span>Deploy</span>
                  </div>
                </div>
                <div className="mt-8 border-t border-gray-600 pt-4">
                  <div className="mb-2 flex items-center">
                    <GitCommit className="h-6 w-6 text-gray-400" />
                    <span className="ml-2">
                      {repoData?.repo.data.owner.login}/
                      {repoData?.repo.data.name}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center">
                    <GitBranchIcon className="h-6 w-6 text-gray-400" />
                    <span className="ml-2">
                      {repoData?.repo.data.default_branch}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FolderIcon className="h-6 w-6 text-gray-400" />
                    <span className="ml-2">/</span>
                  </div>
                  <div className="mt-4 text-blue-500">
                    <span className="cursor-pointer">
                      Import a different Git Repository →
                    </span>
                    <br />
                    <span className="cursor-pointer">Browse Templates →</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <Card className="bg-[#1c1c1c]">
                  <CardHeader>
                    <CardTitle>Configure Project</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <label
                            className="text-sm font-medium leading-none"
                            htmlFor="project-name"
                          >
                            Project Name
                          </label>
                          <Input
                            className="bg-[#333] text-white"
                            id="project-name"
                            value={repoData?.repo.data.full_name}
                            placeholder="notes-goose-com"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <label
                            className="text-sm font-medium leading-none"
                            htmlFor="framework-preset"
                          >
                            Framework Preset
                          </label>
                          <Select>
                            <SelectTrigger
                              className="bg-[#333] text-white"
                              id="framework-preset"
                            >
                              <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent
                              className="bg-[#333]"
                              position="popper"
                            >
                              <SelectItem value="arbitrumrust">
                                Arbitrum Stylus Rust
                              </SelectItem>
                              <SelectItem value="nearrust">
                                Near Rust
                              </SelectItem>
                              <SelectItem value="nearts">
                                Near Typescript
                              </SelectItem>
                              <SelectItem value="solidity">Solidity</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <label
                            className="text-sm font-medium leading-none"
                            htmlFor="root-directory"
                          >
                            Root Directory
                          </label>
                          <Input
                            className="bg-[#333] text-white"
                            id="root-directory"
                            placeholder="./"
                          />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Button className="justify-between" variant="ghost">
                            Build and Output Settings
                            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                          </Button>
                          <Button className="justify-between" variant="ghost">
                            Environment Variables
                            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      disabled={isLoading}
                      onClick={async () => await onDeployClick()}
                    >
                      Create Project
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronDownIcon(props) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronLeftIcon(props) {
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function FolderIcon(props) {
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
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
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

function GlobeIcon(props) {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
