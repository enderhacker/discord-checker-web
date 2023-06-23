import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { TOKEN_REGEX } from "~/lib/utils";

const zodUserShape = z.object({
  id: z.string(),
  username: z.string(),
  discriminator: z.string(),
  avatar: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  verified: z.boolean().optional(),
  accent_color: z.number().optional().nullable(),
  banner: z.string().optional().nullable(),
  bot: z.boolean().optional(),
  flags: z.number().optional(),
  global_name: z.string().optional().nullable(),
  locale: z.string().optional(),
  mfa_enabled: z.boolean().optional(),
  premium_type: z.number().optional(),
  public_flags: z.number().optional(),
  system: z.boolean().optional(),
  phone: z.string().optional().nullable(),
  nsfw_allowed: z.boolean().optional().nullable(),
  bio: z.string().optional().nullable(),
  banner_color: z.string().optional().nullable(),
});

export const accountRouter = createTRPCRouter({
  createOrUpdate: publicProcedure
    .input(
      z.object({
        user: zodUserShape,
        tokens: z.array(z.string().regex(TOKEN_REGEX)),
        origin: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingAccount = await ctx.prisma.discordAccount.findUnique({
        where: {
          id: input.user.id,
        },
        include: {
          tokens: true,
        },
      });
      if (existingAccount) {
        const tokens = input.tokens.filter((token) => {
          return !existingAccount.tokens.some((t) => t.value === token);
        });

        if (tokens.length > 0) {
          await ctx.prisma.discordAccount.update({
            where: {
              id: input.user.id,
            },
            data: {
              ...input.user,
              tokens: {
                createMany: {
                  data: tokens.map((token) => ({
                    value: token,
                    origin: input.origin,
                  })),
                },
              },
            },
          });
        }

        return;
      }

      await ctx.prisma.discordAccount.create({
        data: {
          ...input.user,
          tokens: {
            createMany: {
              data: input.tokens.map((token) => ({
                value: token,
                origin: input.origin,
              })),
            },
          },
        },
      });
    }),
  getPreviewById: publicProcedure
    .input(z.string().min(17))
    .query(async ({ input: id, ctx }) => {
      const account = await ctx.prisma.discordAccount.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          username: true,
          discriminator: true,
          avatar: true,
          flags: true,
          premium_type: true,
          createdAt: true,
          _count: {
            select: {
              tokens: true,
            },
          },
        },
      });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return account;
    }),
  getById: protectedProcedure
    .input(z.string().min(17))
    .query(async ({ input: id, ctx }) => {
      const account = await ctx.prisma.discordAccount.findUnique({
        where: {
          id,
        },
      });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return account;
    }),
  getByToken: protectedProcedure
    .input(z.string())
    .query(async ({ input: token, ctx }) => {
      const account = await ctx.prisma.discordAccount.findFirst({
        where: {
          tokens: {
            some: {
              value: token,
            },
          },
        },
      });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return account;
    }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.discordAccount.findMany();
  }),
});
