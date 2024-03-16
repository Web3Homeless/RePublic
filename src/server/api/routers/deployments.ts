import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const deploymentsRouter = createTRPCRouter({
  getAllDeployments: publicProcedure
    .input(z.object({ repoName: z.string() }))
    .query(async ({ ctx, input }) => {
      //   const res = await ctx.db.userDeployment.findMany({
      //     where: {
      //         repoName:
      //     },
      //   });

      return {
        deployments: res,
      };
    }),

  gerDeploymentStatus: publicProcedure
    .input(z.object({ deploymentId: z.string() }))
    .query(async ({ ctx, input }) => {}),
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
