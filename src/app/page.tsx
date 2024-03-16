import { unstable_noStore as noStore } from "next/cache";
import { ApiError } from "next/dist/server/api-utils";
import Link from "next/link";
import UpperNavbar from "~/components/core/upper-navbar";

import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Home() {
  //noStore();
  console.log("SUSSSS");
  const session = await getServerAuthSession();
  console.log("session");
  console.log(session);

  return (
    <div>
      <UpperNavbar orgName="" projectName=""></UpperNavbar>
      <main className="flex min-h-screen flex-col items-center justify-start text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Are you ready <span className="text-red-500">to Ship?</span>
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href={`/org/${session?.user.githubLogin}/projects`}
            >
              <h3 className="text-2xl font-bold">Let's begin →</h3>
              <div className="text-lg">
                Go to your organisation settings - import project and deploy
                contracts
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://github.com/Web3Homeless/RePublic"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Documentation →</h3>
              <div className="text-lg">
                Learn more about project on main github README.md page
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            {/* 
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
}
