"use client";

import React from "react";
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

type Props = {};

export default function ProjectCollection({}: Props) {
  const { data, isLoading } =
    api.github.getAllReposWithInstallations.useQuery();

  if (isLoading) {
    return <div>Is loading.......</div>;
  }

  const repos = data?.repos.map((r) => <div key={r.id}>{r.name}</div>);

  return (
    <div className="flex flex-col gap-10 px-10 py-5">
      <div className="flex flex-row gap-10">
        <Link href="https://github.com/apps/republic-eth/installations/new">
          <Button>Install Github App</Button>
        </Link>
        {/* <Link href="import">
          <Button>Import new Project</Button>
        </Link> */}
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
            <Button variant={"secondary"}>Install Github App</Button>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Repository
                </Label>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex items-center justify-center">
              <Button type="submit" className="w-full">
                Import Github Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>{repos}</div>
    </div>
  );
}
