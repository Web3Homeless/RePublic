import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const deploymentsRouter = createTRPCRouter({
  getAllDeployments: publicProcedure
    .input(z.object({ repoName: z.string() }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.userDeployment.findMany({
        where: {
          repoName: input.repoName,
        },
        select: {
          zipArchive: false,
        },
      });

      console.log(res);

      return {
        deployments: res,
      };
    }),

  getDeploymentStatus: publicProcedure
    .input(z.object({ deploymentId: z.string() }))
    .query(async ({ ctx, input }) => {
      return {
        a: true,
      };
    }),

  getMainDeploy: publicProcedure
    .input(z.object({}))
    .query(async ({ ctx, input }) => {
      return {
        a: true,
      };
    }),
});
