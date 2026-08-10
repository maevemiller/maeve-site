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

export const collections = { projects, blog, movies, food, music, travel };
