import { defineConfig } from "tinacms";
import {
	blogFields,
	content_footerFields,
	eventsFields,
	footerFields,
	home_page_big_cardsFields,
	home_page_cardsFields,
	pageFields,
	poc_scholarsFields,
	staffFields,
	guestFields,
	exhibitorFields,
	globalFields,
} from "./templates";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

// configuration
export default defineConfig({
	branch,
	clientId: process.env.TINACMS_CLIENT_ID || "", // Get this from tina.io
	token: process.env.TINACMS_TOKEN || "", // Get this from tina.io
	client: { skip: true },
	build: {
		outputFolder: "admin",
		publicFolder: "src",
	},
	media: {
		tina: {
			mediaRoot: "images",
			publicFolder: "src",
		},
	},
	schema: {
		collections: [
			{
				format: "json",
				label: "Global",
				name: "global",
				path: "src/_data/",
				match: {
					include: "global",
				},
				ui: {
					allowedActions: {
						create: false,
						delete: false,
					},
				},
				fields: [...globalFields()],
			},
			{
				format: "md",
				label: "Pages",
				name: "pages",
				path: "src",
				match: {
					include: "*",
				},
				templates: [
					{
						fields: [
							{
								type: "rich-text",
								name: "body",
								label: "Body of Document",
								description: "This is the markdown body",
								isBody: true,
							},
							...eventsFields(),
						],
						label: "events",
						name: "events",
					},
					{
						fields: [
							{
								type: "rich-text",
								name: "body",
								label: "Body of Document",
								description: "This is the markdown body",
								isBody: true,
							},
							...pageFields(),
						],
						label: "page",
						name: "page",
					},
				],
				defaultItem: () => {
					return {
						event: "both",
					};
				},
			},
			{
				format: "md",
				label: "Blog",
				name: "blog",
				path: "src/blog",
				match: {
					include: "**/*",
				},
				fields: [...blogFields()],
				defaultItem: () => {
					return {
						date: new Date().toISOString(),
					};
				},
			},
			{
				format: "md",
				label: "Staff",
				name: "staff",
				path: "src/staff",
				match: {
					include: "**/*",
				},
				fields: [
					{
						type: "rich-text",
						name: "body",
						label: "Body of Document",
						description: "This is the markdown body",
						isBody: true,
					},
					...staffFields(),
				],
			},
			{
				format: "md",
				label: "Guests",
				name: "guests",
				path: "src/guests",
				match: {
					include: "**/*",
				},
				fields: [
					{
						type: "rich-text",
						name: "body",
						label: "Body of Document",
						description: "This is the markdown body",
						isBody: true,
					},
					...guestFields(),
				],
			},
			{
				format: "md",
				label: "Exhibitors",
				name: "exhibitors",
				path: "src/exhibitors",
				match: {
					include: "**/*",
				},
				fields: [
					{
						type: "rich-text",
						name: "body",
						label: "Body of Document",
						description: "This is the markdown body",
						isBody: true,
					},
					...exhibitorFields(),
				],
			},
			{
				format: "md",
				label: "PoC Scholars",
				name: "poc_scholars",
				path: "src/poc-scholars",
				match: {
					include: "**/*",
				},
				fields: [
					{
						type: "rich-text",
						name: "body",
						label: "Body of Document",
						description: "This is the markdown body",
						isBody: true,
					},
					...poc_scholarsFields(),
				],
			},
			{
				format: "md",
				label: "Home Page Cards",
				name: "home_page_cards",
				path: "src/cards",
				match: {
					include: "**/*",
				},
				fields: [
					{
						type: "rich-text",
						name: "body",
						label: "Body of Document",
						description: "This is the markdown body",
						isBody: true,
					},
					...home_page_cardsFields(),
				],
			},
			{
				format: "md",
				label: "Home Page Big Cards",
				name: "home_page_big_cards",
				path: "src/cards-big",
				match: {
					include: "**/*",
				},
				fields: [
					{
						type: "rich-text",
						name: "body",
						label: "Body of Document",
						description: "This is the markdown body",
						isBody: true,
					},
					...home_page_big_cardsFields(),
				],
			},
			{
				format: "md",
				label: "Content Footer",
				name: "content_footer",
				path: "src/contentfooter",
				match: {
					include: "**/*",
				},
				fields: [
					{
						type: "rich-text",
						name: "body",
						label: "Body of Document",
						description: "This is the markdown body",
						isBody: true,
					},
					...content_footerFields(),
				],
			},
			{
				format: "md",
				label: "Footer",
				name: "footer",
				path: "src/footer",
				match: {
					include: "**/*",
				},
				fields: [
					{
						type: "rich-text",
						name: "body",
						label: "Body of Document",
						description: "This is the markdown body",
						isBody: true,
					},
					...footerFields(),
				],
			},
		],
	},
});
