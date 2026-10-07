import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const caseStudies = defineCollection({
  loader: glob({ base: './src/content/case-studies', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    context: z.string(),
    order: z.number().int(),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).min(2).max(4),
    stack: z.array(z.string()).min(3),
    loom: z.url().optional(),
    diagram: z.enum(['cost', 'mcp', 'mirror']),
  }),
});

export const collections = { caseStudies };
