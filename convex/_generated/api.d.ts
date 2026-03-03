/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as aiInternal from "../aiInternal.js";
import type * as bookings from "../bookings.js";
import type * as clientPortal from "../clientPortal.js";
import type * as clients from "../clients.js";
import type * as contentAssets from "../contentAssets.js";
import type * as email from "../email.js";
import type * as employees from "../employees.js";
import type * as expenses from "../expenses.js";
import type * as feedback from "../feedback.js";
import type * as invoices from "../invoices.js";
import type * as leads from "../leads.js";
import type * as leaveRequests from "../leaveRequests.js";
import type * as payments from "../payments.js";
import type * as posts from "../posts.js";
import type * as projects from "../projects.js";
import type * as settings from "../settings.js";
import type * as socialPosts from "../socialPosts.js";
import type * as tasks from "../tasks.js";
import type * as teamPortal from "../teamPortal.js";
import type * as timeEntries from "../timeEntries.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";
import type * as vendors from "../vendors.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  aiInternal: typeof aiInternal;
  bookings: typeof bookings;
  clientPortal: typeof clientPortal;
  clients: typeof clients;
  contentAssets: typeof contentAssets;
  email: typeof email;
  employees: typeof employees;
  expenses: typeof expenses;
  feedback: typeof feedback;
  invoices: typeof invoices;
  leads: typeof leads;
  leaveRequests: typeof leaveRequests;
  payments: typeof payments;
  posts: typeof posts;
  projects: typeof projects;
  settings: typeof settings;
  socialPosts: typeof socialPosts;
  tasks: typeof tasks;
  teamPortal: typeof teamPortal;
  timeEntries: typeof timeEntries;
  transactions: typeof transactions;
  users: typeof users;
  vendors: typeof vendors;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
