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

import { Button } from "~/components/ui/button";
import Link from "next/link";

type Props = {};

export default function ProjectCollection({}: Props) {
  const { data, isLoading } = api.github.getAllGhProjects.useQuery();

  if (isLoading) {
    return <div>Is loading.......</div>;
  }

  const repos = data?.repos.map((r) => <div key={r.id}>{r.name}</div>);

  return (
    <div className="flex flex-col gap-10 px-10 py-5">
      <div className="flex flex-row gap-10">
        <Link href="import">
          <Button>Import new Project</Button>
        </Link>
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
