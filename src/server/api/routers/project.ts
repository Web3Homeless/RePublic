import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const projectRouter = createTRPCRouter({
  listProjects: publicProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.userProject.findMany({
      where: {
        user_id: ctx.session?.user.id,
      },
    });

    return {
      projects: projects,
    };
  }),

  createProject: publicProcedure
    .input(z.object({ owner: z.string(), repo: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session == null) {
        return {
          isSucceed: false,
        };
      }

      console.log("BEFORE SESSION");
      console.log(ctx.session.user.id);
      console.log("AFTER SESSION");

      const res = await ctx.db.userProject.create({
        data: {
          owner: input.owner,
          repoName: input.repo,
          user_id: ctx.session.user.id,
        },
      });

      console.log(res);

      return {
        isSucceed: true,
      };
    }),
});
