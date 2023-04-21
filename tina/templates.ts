import type { TinaField } from "tinacms";
export function blogFields() {
  return [
    {
      type: "string",
      name: "title",
      label: "title",
      required: true,
    },
    {
      type: "datetime",
      name: "date",
      label: "date",
    },
    {
      type: "boolean",
      name: "published",
      label: "published",
    },
    {
      type: "string",
      name: "excerpt",
      label: "excerpt",
      ui: {
        component: "textarea",
      },
    },
    {
      type: "image",
      name: "coverImage",
      label: "cover image",
    },
    {
      type: "string",
      name: "coverImageAlt",
      label: "cover image alt text",
    },
    {
      type: "image",
      name: "ogImage",
      label: "open graph image",
    },
  ] as TinaField[];
}
export function content_footerFields() {
  return [
    {
      type: "string",
      name: "title",
      label: "title",
    },
    {
      type: "boolean",
      name: "published",
      label: "published",
    },
    {
      type: "string",
      name: "location",
      label: "location",
    },
    {
      type: "number",
      name: "order",
      label: "order",
    },
  ] as TinaField[];
}
export function eventsFields() {
  return [
    {
      type: "string",
      name: "layout",
      label: "layout",
    },
    {
      type: "string",
      name: "title",
      label: "title",
    },
    {
      type: "boolean",
      name: "published",
      label: "published",
    },
    {
      type: "string",
      name: "description",
      label: "description",
    },
    {
      type: "image",
      name: "ogImage",
      label: "open graph image",
    },
    {
      type: "string",
      name: "navGroup",
      label: "navGroup",
      options: ["Attend", "Events", "Volunteer", "Community", "Blog"],
    },
    {
      type: "string",
      name: "navTitle",
      label: "navTitle",
    },
    {
      type: "number",
      name: "order",
      label: "order",
    },
    {
      type: "string",
      name: "icon",
      label: "icon",
      options: [
        "accessibility",
        "add",
        "art",
        "badge",
        "book",
        "booth",
        "bullhorn",
        "calendar-clock",
        "calendar-star",
        "close",
        "dice",
        "discord",
        "envelope",
        "faq",
        "games-on-demand",
        "gift",
        "health",
        "hotel",
        "image",
        "itch-io",
        "kickstarter",
        "library",
        "light-bulb",
        "list",
        "menu",
        "moon",
        "overlap",
        "parachute",
        "party",
        "paw",
        "pencil-square",
        "pig",
        "price-tags",
        "scholar",
        "scroll",
        "settings",
        "shield",
        "square-check",
        "square-full",
        "square-open",
        "star",
        "sun",
        "trophy",
        "twitch",
        "twitter",
        "website",
        "wolf",
        "youtube",
      ],
    },
    {
      type: "string",
      name: "events_type",
      label: "events_type",
      options: ["online", "irl"],
    },
    {
      type: "string",
      name: "events_status",
      label: "events_status",
      options: ["preview", "live"],
    },
    {
      type: "boolean",
      name: "suggestEvent",
      label: "suggestEvent",
    },
    {
      type: "boolean",
      name: "runEvent",
      label: "runEvent",
    },
  ] as TinaField[];
}
export function footerFields() {
  return [
    {
      type: "string",
      name: "title",
      label: "title",
    },
    {
      type: "number",
      name: "order",
      label: "order",
    },
    {
      type: "boolean",
      name: "published",
      label: "published",
    },
  ] as TinaField[];
}
export function home_page_big_cardsFields() {
  return [
    {
      type: "string",
      name: "title",
      label: "title",
    },
    {
      type: "number",
      name: "order",
      label: "order",
    },
    {
      type: "boolean",
      name: "published",
      label: "published",
    },
    {
      type: "image",
      name: "image",
      label: "image",
    },
    {
      type: "string",
      name: "alt",
      label: "image alt text",
    },
  ] as TinaField[];
}
export function home_page_cardsFields() {
  return [
    {
      type: "string",
      name: "title",
      label: "title",
    },
    {
      type: "number",
      name: "order",
      label: "order",
    },
    {
      type: "boolean",
      name: "published",
      label: "published",
    },
  ] as TinaField[];
}
export function pageFields() {
  return [
    {
      type: "string",
      name: "layout",
      label: "layout",
      options: [
        "layouts/events.njk",
        "layouts/events-archive.njk",
        "layouts/home.njk",
        "layouts/page.njk",
        "layouts/page-wide.njk",
        "layouts/form-activate-gift-badge.njk",
        "layouts/form-apply-for-scholarship.njk",
        "layouts/form-buy-a-badge.njk",
        "layouts/form-change-password.njk",
        "layouts/form-contact-us.njk",
        "layouts/form-covid-support.njk",
        "layouts/form-create-account.njk",
        "layouts/form-exhibitor.njk",
        "layouts/form-register.njk",
        "layouts/form-run-games-on-demand.njk",
        "layouts/form-run-an-event.njk",
        "layouts/form-suggest-event.njk",
        "layouts/form-volunteer-signup.njk",
        "layouts/poc-scholars.njk",
        "layouts/register-thank-you.njk",
        "layouts/staff.njk",
        "layouts/volunteer-shifts.njk",
      ],
    },
    {
      type: "string",
      name: "title",
      label: "title",
    },
    {
      type: "boolean",
      name: "published",
      label: "published",
    },
    {
      type: "string",
      name: "description",
      label: "description",
      ui: {
        component: "textarea",
      },
    },
    {
      type: "image",
      name: "ogImage",
      label: "open graph image",
    },
    {
      type: "string",
      name: "navGroup",
      label: "navGroup",
      options: ["Attend", "Events", "Volunteer", "Community", "Blog"],
    },
    {
      type: "string",
      name: "navTitle",
      label: "navTitle",
    },
    {
      type: "number",
      name: "order",
      label: "order",
    },
    {
      type: "string",
      name: "icon",
      label: "icon",
      options: [
        "accessibility",
        "add",
        "art",
        "badge",
        "book",
        "booth",
        "bullhorn",
        "calendar-clock",
        "calendar-star",
        "close",
        "dice",
        "discord",
        "envelope",
        "faq",
        "games-on-demand",
        "gift",
        "health",
        "hotel",
        "image",
        "itch-io",
        "kickstarter",
        "library",
        "light-bulb",
        "list",
        "menu",
        "moon",
        "overlap",
        "parachute",
        "party",
        "paw",
        "pencil-square",
        "pig",
        "price-tags",
        "scholar",
        "scroll",
        "settings",
        "shield",
        "square-check",
        "square-full",
        "square-open",
        "star",
        "sun",
        "trophy",
        "twitch",
        "twitter",
        "website",
        "wolf",
        "youtube",
      ],
    },
  ] as TinaField[];
}
export function poc_scholarsFields() {
  return [
    {
      type: "string",
      name: "title",
      label: "Name",
      required: true,
    },
    {
      type: "string",
      name: "position",
      label: "Position Title",
    },
    {
      type: "string",
      name: "tags",
      label: "tags",
      options: ["poc-scholar", "poc-team-member"],
      required: true,
    },
    {
      type: "boolean",
      name: "published",
      label: "published",
    },
    {
      type: "string",
      name: "gender",
      label: "gender",
      required: true,
    },
    {
      type: "number",
      name: "order",
      label: "order",
    },
    {
      type: "image",
      name: "image",
      label: "image",
    },
    {
      type: "string",
      name: "twitter",
      label: "twitter handle",
    },
    {
      type: "string",
      name: "mastodon",
      label: "mastodon handle",
    },
    {
      type: "string",
      name: "website_name",
      label: "website name",
    },
    {
      type: "string",
      name: "website_url",
      label: "website url",
    },
  ] as TinaField[];
}
export function staffFields() {
  return [
    {
      type: "string",
      name: "title",
      label: "Name",
      required: true,
    },
    {
      type: "string",
      name: "position",
      label: "Position Title",
    },
    {
      type: "string",
      name: "tags",
      label: "tags",
      options: ["staff", "staff-emeritus"],
      required: true,
    },
    {
      type: "boolean",
      name: "published",
      label: "published",
    },
    {
      type: "string",
      name: "gender",
      label: "gender",
      required: true,
    },
    {
      type: "number",
      name: "order",
      label: "order",
    },
    {
      type: "image",
      name: "image",
      label: "image",
    },
    {
      type: "string",
      name: "twitter",
      label: "twitter handle",
    },
    {
      type: "string",
      name: "mastodon",
      label: "mastodon handle",
    },
    {
      type: "string",
      name: "website_name",
      label: "website name",
    },
    {
      type: "string",
      name: "website_url",
      label: "website url",
    },
  ] as TinaField[];
}