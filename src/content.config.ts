import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    github: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    date: z.coerce.date(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    excerpt: z.string().optional(),
  }),
});

const movies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/movies' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      rating: z.number().min(1).max(5),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      image: image().optional(),
      blurb: z.string().optional(),
    }),
});

const food = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/food' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      rating: z.number().min(1).max(5),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      image: image().optional(),
      blurb: z.string().optional(),
      location: z.string().optional(),
    }),
});

const music = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/music' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      rating: z.number().min(1).max(5),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      image: image().optional(),
      blurb: z.string().optional(),
      artist: z.string().optional(),
    }),
});

const travel = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/travel' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      location: z.string(),
      date: z.coerce.date(),
      photo: image().optional(),
      tags: z.array(z.string()).default([]),
    }),
});

const vibes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/vibes' }),
  schema: z.object({
    category: z.string(),
    items: z.array(z.string()).min(1).max(5),
    order: z.number().default(0),
  }),
});

const reading = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/reading' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      type: z.enum(['book', 'podcast']),
      creator: z.string().optional(),
      rating: z.number().min(1).max(5),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      image: image().optional(),
      blurb: z.string().optional(),
    }),
});

const sites = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/sites' }),
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    blurb: z.string().optional(),
  }),
});

const learningLists = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/learning-lists' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    items: z.array(z.string()).min(1),
    order: z.number().default(0),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/now' }),
  schema: z.object({
    updated: z.coerce.date(),
    items: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          icon: z.enum(['reading', 'listening', 'learning']),
        })
      )
      .min(1),
  }),
});

export const collections = { projects, blog, movies, food, music, travel, vibes, now, reading, sites, learningLists };
