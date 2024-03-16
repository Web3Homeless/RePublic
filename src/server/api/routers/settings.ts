import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const settingsRouter = createTRPCRouter({
  getAllSettings: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const settings = await ctx.db.branchMapper.findMany({
        where: {
          project_id: input.projectId,
          user_id: ctx.session?.user.id,
        },
      });

      return {
        settings: settings,
      };
    }),

  createNewMapping: publicProcedure
    .input(
      z.object({
        branch: z.string(),
        projectId: z.string(),
        deployTarget: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(ctx.session?.user);

      const result = await ctx.db.branchMapper.create({
        data: {
          branch: input.branch,
          project_id: input.projectId,
          deployTarget: input.deployTarget,
          user_id: ctx.session?.user.id,
        },
      });

      return {
        result: result,
      };
    }),

  updateMapping: publicProcedure
    .input(
      z.object({
        branch: z.string(),
        deployTarget: z.string(),
        mappingId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(input.branch);

      const result = await ctx.db.branchMapper.update({
        where: {
          id: input.mappingId,
          user_id: ctx.session?.user.id,
        },
        data: {
          branch: input.branch,
          deployTarget: input.deployTarget,
        },
      });

      return {
        result: result,
      };
    }),

  deleteMapping: publicProcedure
    .input(z.object({ mappingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.branchMapper.delete({
        where: {
          id: input.mappingId,
        },
      });

      return {
        result: result,
      };
    }),
});
