import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { ExitIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Props = {};

export default function NavAvatar({}: Props) {
  const router = useRouter();
  const session = useSession();

  return (
    <div className="flex flex-row gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex flex-row items-center gap-2">
          <Avatar>
            <AvatarImage src={session.data?.user.image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuItem
            className="justify-between"
            onClick={() => {
              router.push("/api/auth/signout");
            }}
          >
            Sign Out
            <ExitIcon></ExitIcon>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
