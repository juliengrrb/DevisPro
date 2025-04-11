import { pgTable, text, serial, numeric, date, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  siret: text("siret"),
  rcs: text("rcs"),
  naf: text("naf"),
  vatNumber: text("vat_number"),
  capitalSocial: text("capital_social"),
  logo: text("logo"),
  primaryColor: text("primary_color").default("hsl(172, 80%, 29%)"),
  website: text("website"),
  decennaleInsurance: text("decennale_insurance"),
  biennaleInsurance: text("biennale_insurance"),
  legalMentions: text("legal_mentions"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  companyName: true,
  email: true,
  phone: true,
  address: true,
  siret: true,
  rcs: true,
  naf: true,
  vatNumber: true,
  capitalSocial: true,
  logo: true,
  primaryColor: true,
  website: true,
  decennaleInsurance: true,
  biennaleInsurance: true,
  legalMentions: true,
});

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull().default("individual"), // individual or company
  firstName: text("first_name"),
  lastName: text("last_name"),
  companyName: text("company_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  zipCode: text("zip_code"),
  country: text("country").default("France"),
  siret: text("siret"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).pick({
  userId: true,
  type: true,
  firstName: true,
  lastName: true,
  companyName: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  zipCode: true,
  country: true,
  siret: true,
  notes: true,
});

// Project schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clientId: integer("client_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address"),
  city: text("city"),
  zipCode: text("zip_code"),
  country: text("country").default("France"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  progress: integer("progress").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  userId: true,
  clientId: true,
  name: true,
  description: true,
  address: true,
  city: true,
  zipCode: true,
  country: true,
  startDate: true,
  endDate: true,
  progress: true,
});

// Quote schema
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clientId: integer("client_id").notNull(),
  projectId: integer("project_id"),
  number: text("number").notNull(),
  status: text("status").notNull().default("draft"), // draft, sent, signed, rejected
  issueDate: date("issue_date").notNull(),
  validUntil: date("valid_until"),
  notes: text("notes"),
  conditions: text("conditions"),
  totalHT: numeric("total_ht", { precision: 10, scale: 2 }).notNull().default("0"),
  totalTVA: numeric("total_tva", { precision: 10, scale: 2 }).notNull().default("0"),
  totalTTC: numeric("total_ttc", { precision: 10, scale: 2 }).notNull().default("0"),
  deposit: numeric("deposit", { precision: 10, scale: 2 }).default("0"),
  depositPercent: integer("deposit_percent").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertQuoteSchema = createInsertSchema(quotes).pick({
  userId: true,
  clientId: true,
  projectId: true,
  number: true,
  status: true,
  issueDate: true,
  validUntil: true,
  notes: true,
  conditions: true,
  totalHT: true,
  totalTVA: true,
  totalTTC: true,
  deposit: true,
  depositPercent: true,
});

// Quote line items schema
export const quoteLineItems = pgTable("quote_line_items", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").notNull(),
  type: text("type").notNull(), // title, subtitle, text, material, labor, work
  title: text("title"),
  description: text("description"),
  quantity: numeric("quantity", { precision: 10, scale: 2 }),
  unit: text("unit"),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }),
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 }),
  totalHT: numeric("total_ht", { precision: 10, scale: 2 }),
  position: integer("position").notNull(),
});

export const insertQuoteLineItemSchema = createInsertSchema(quoteLineItems).pick({
  quoteId: true,
  type: true,
  title: true,
  description: true,
  quantity: true,
  unit: true,
  unitPrice: true,
  vatRate: true,
  totalHT: true,
  position: true,
});

// Invoice schema
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  quoteId: integer("quote_id").notNull(),
  clientId: integer("client_id").notNull(),
  projectId: integer("project_id"),
  number: text("number").notNull(),
  type: text("type").notNull().default("final"), // deposit, intermediate, final
  status: text("status").notNull().default("pending"), // pending, paid
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date"),
  totalHT: numeric("total_ht", { precision: 10, scale: 2 }).notNull().default("0"),
  totalTVA: numeric("total_tva", { precision: 10, scale: 2 }).notNull().default("0"),
  totalTTC: numeric("total_ttc", { precision: 10, scale: 2 }).notNull().default("0"),
  paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  userId: true,
  quoteId: true,
  clientId: true,
  projectId: true,
  number: true,
  type: true,
  status: true,
  issueDate: true,
  dueDate: true,
  totalHT: true,
  totalTVA: true,
  totalTTC: true,
  paidAmount: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type QuoteLineItem = typeof quoteLineItems.$inferSelect;
export type InsertQuoteLineItem = z.infer<typeof insertQuoteLineItemSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
