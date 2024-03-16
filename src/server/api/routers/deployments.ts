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
          id: true,
          user_id: true,
          project_id: true,
          owner: true,
          repoName: true,
          deployedAddress: true,
          chainId: true,
          environment: true,
          branch: true,
          lastUpdated: true,
          details: true,
          updatedBy: true,
          status: true,
          archiveUrl: true,
          installationId: true,
          zipArchive: false,
        },
        orderBy: {
          lastUpdated: "desc",
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
      const deployment = await ctx.db.userDeployment.findFirst({
        where: {
          id: input.deploymentId,
        },
      });

      return {
        deployment: deployment,
      };
    }),

  getDeploymentLogs: publicProcedure
    .input(z.object({ deploymentId: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log("LOGS!!");

      const logs = await ctx.db.deploymentLog.findMany({
        where: {
          deploymentId: input.deploymentId,
        },
      });

      console.log(logs);

      return {
        logs: logs,
      };
    }),

  getMainDeploy: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log("PROEJCTID", input.projectId);

      const deployments = await ctx.db.userDeployment.findMany({
        where: {
          repoName: input.projectId,
          status: "Success",
        },
        select: {
          id: true,
          user_id: true,
          project_id: true,
          owner: true,
          repoName: true,
          deployedAddress: true,
          chainId: true,
          environment: true,
          branch: true,
          lastUpdated: true,
          details: true,
          updatedBy: true,
          status: true,
          installationId: true,
          deploymenttransaction: true,
          zipArchive: false,
        },
      });

      console.log("COMPLETED QUERY", deployments);

      return {
        deployments: deployments,
      };
    }),
});
