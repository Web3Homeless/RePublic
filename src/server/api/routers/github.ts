import { Octokit } from "@octokit/rest";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getInstallationAccessToken } from "~/app/api/github/webhook/route";

export const githubRouter = createTRPCRouter({
  getAllGhProjects: publicProcedure.query(async ({ ctx }) => {
    const account = await ctx.db.account.findFirst({
      where: {
        userId: ctx.session?.user.id,
      },
    });

    const octokit = new Octokit({
      auth: `${account?.access_token}`,
    });

    const allRepos = await getUserRepositories(octokit);

    return {
      repos: allRepos,
    };
  }),

  getRepoById: publicProcedure
    .input(z.object({ repo: z.string().min(1), owner: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.account.findFirst({
        where: {
          userId: ctx.session?.user.id,
        },
      });

      const octokit = new Octokit({
        auth: `${account?.access_token}`,
      });

      const response = await octokit.rest.repos.get({
        owner: input.owner,
        repo: input.repo,
      });

      console.log(response);

      return {
        repo: response,
      };
    }),

  getAllReposWithInstallations: publicProcedure.query(async ({ ctx }) => {
    const account = await ctx.db.account.findFirst({
      where: {
        userId: ctx.session?.user.id,
      },
    });

    console.log(account);

    const installation = await ctx.db.githubInstallation.findFirst({
      where: {
        user_id: account?.providerAccountId,
      },
      orderBy: {
        id: "desc",
      },
    });

    console.log(installation);
    console.log("SOME SOME SOME");

    const token = await getInstallationAccessToken(
      installation!.installation_id,
    );

    console.log("TOKEN");
    console.log(token.token);
    console.log("AFTER TOKEN");

    const octokit = new Octokit({
      auth: `${token.token}`,
    });

    const repos = await listInstallationsForUser(octokit);

    console.log(repos);

    return {
      repos: repos?.data,
    };
  }),
});

async function listInstallationsForUser(octokit: Octokit) {
  try {
    const response = await octokit.request("GET /installation/repositories", {
      headers: {
        accept: "application/vnd.github.machine-man-preview+json",
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching installations for user:", error);
    return null;
  }
}

async function getUserRepositories(octokit: Octokit) {
  try {
    const response = await octokit.request("GET /user/repos", {
      type: "owner",
      sort: "updated",
      per_page: 100,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching repositories: ${error}`);
    return [];
  }
}
