import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

// Custom date schema that handles invalid dates gracefully
const dateSchema = z.preprocess((val) => {
	if (!val) return null;
	const date = new Date(val);
	return isNaN(date.getTime()) ? null : date;
}, z.date().nullable().default(() => new Date()));

// Slug generation function
function generateSlug(str: string): string {
	return str
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		subtitle: z.string().optional().nullable(),
		description: z.string().optional().nullable(),
		publish: z.boolean().default(true),
		created_date: dateSchema,
		updated_date: dateSchema,
		featured_image: z.string().optional().nullable(),
		featured_image_alt: z.string().optional().nullable(),
		// Transform slug: use provided slug or generate from title
		slug: z.string()
			.optional()
			.nullable()
			.transform((val, ctx) => {
				if (val) return val;  // Use provided slug if it exists
				// Generate from title if no slug provided
				const title = ctx.get('title') as string;
				return generateSlug(title);
			}),
		tags: z.array(z.string()).default([]).nullable(),
		// SEO specific fields
		meta_title: z.string().optional().nullable(),
			meta_description: z.string().optional().nullable(),
			canonical_url: z.string().optional().nullable(),
			og_title: z.string().optional().nullable(),
			og_description: z.string().optional().nullable(),
			og_image: z.string().optional().nullable(),
			og_type: z.string().default('article'),
			twitter_title: z.string().optional().nullable(),
			twitter_description: z.string().optional().nullable(),
			twitter_image: z.string().optional().nullable(),
			twitter_card: z.string().default('summary_large_image'),
			keywords: z.array(z.string()).default([]).nullable(),
			author: z.string().optional().nullable(),
			reading_time: z.number().optional().nullable(),
			no_index: z.boolean().default(false),
	}),
});

export const collections = { blog };
