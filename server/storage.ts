import { 
  users, type User, type InsertUser,
  clients, type Client, type InsertClient,
  projects, type Project, type InsertProject,
  quotes, type Quote, type InsertQuote,
  quoteLineItems, type QuoteLineItem, type InsertQuoteLineItem,
  invoices, type Invoice, type InsertInvoice
} from "@shared/schema";

// Storage interface with all the CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Client operations
  getClient(id: number): Promise<Client | undefined>;
  getClientsByUserId(userId: number): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  getProjectsByClientId(clientId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Quote operations
  getQuote(id: number): Promise<Quote | undefined>;
  getQuotesByUserId(userId: number): Promise<Quote[]>;
  getQuotesByClientId(clientId: number): Promise<Quote[]>;
  getQuotesByProjectId(projectId: number): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;
  
  // Quote line items operations
  getQuoteLineItems(quoteId: number): Promise<QuoteLineItem[]>;
  createQuoteLineItem(lineItem: InsertQuoteLineItem): Promise<QuoteLineItem>;
  updateQuoteLineItem(id: number, lineItem: Partial<InsertQuoteLineItem>): Promise<QuoteLineItem | undefined>;
  deleteQuoteLineItem(id: number): Promise<boolean>;
  deleteQuoteLineItemsByQuoteId(quoteId: number): Promise<boolean>;

  // Invoice operations
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByUserId(userId: number): Promise<Invoice[]>;
  getInvoicesByQuoteId(quoteId: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;

  // Dashboard operations
  getDashboardStats(userId: number): Promise<{
    totalQuotes: number;
    pendingQuotes: number;
    acceptedQuotes: number;
    totalRevenue: number;
    quoteIncrease: number;
    revenueIncrease: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private projects: Map<number, Project>;
  private quotes: Map<number, Quote>;
  private quoteLineItems: Map<number, QuoteLineItem>;
  private invoices: Map<number, Invoice>;
  
  private userCurrentId: number;
  private clientCurrentId: number;
  private projectCurrentId: number;
  private quoteCurrentId: number;
  private quoteLineItemCurrentId: number;
  private invoiceCurrentId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.projects = new Map();
    this.quotes = new Map();
    this.quoteLineItems = new Map();
    this.invoices = new Map();
    
    this.userCurrentId = 1;
    this.clientCurrentId = 1;
    this.projectCurrentId = 1;
    this.quoteCurrentId = 1;
    this.quoteLineItemCurrentId = 1;
    this.invoiceCurrentId = 1;

    // Add demo user
    this.createUser({
      username: "demo",
      password: "demo",
      companyName: "DevisPro BTP",
      email: "contact@devispro-btp.com",
      phone: "01 23 45 67 89",
      address: "123 Avenue de la Construction, 75001 Paris",
      siret: "123 456 789 00012",
      rcs: "Paris B 123 456 789",
      naf: "4120A",
      vatNumber: "FR 12 345678901",
      capitalSocial: "10 000 €",
      logo: "",
      website: "www.devispro-btp.com",
      decennaleInsurance: "AXA Assurances n°1234567890",
      biennaleInsurance: "AXA Assurances n°0987654321",
      legalMentions: "Entreprise assujettie à la TVA"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return undefined;
    }
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientsByUserId(userId: number): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(
      (client) => client.userId === userId,
    );
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.clientCurrentId++;
    const now = new Date();
    const client: Client = { 
      ...insertClient, 
      id, 
      createdAt: now 
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    if (!existingClient) {
      return undefined;
    }
    
    const updatedClient = { ...existingClient, ...clientData };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId,
    );
  }

  async getProjectsByClientId(clientId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.clientId === clientId,
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectCurrentId++;
    const now = new Date();
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: now 
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) {
      return undefined;
    }
    
    const updatedProject = { ...existingProject, ...projectData };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Quote methods
  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async getQuotesByUserId(userId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(
      (quote) => quote.userId === userId,
    );
  }

  async getQuotesByClientId(clientId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(
      (quote) => quote.clientId === clientId,
    );
  }

  async getQuotesByProjectId(projectId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(
      (quote) => quote.projectId === projectId,
    );
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = this.quoteCurrentId++;
    const now = new Date();
    const quote: Quote = { 
      ...insertQuote, 
      id, 
      createdAt: now,
      updatedAt: now 
    };
    this.quotes.set(id, quote);
    return quote;
  }

  async updateQuote(id: number, quoteData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const existingQuote = this.quotes.get(id);
    if (!existingQuote) {
      return undefined;
    }
    
    const now = new Date();
    const updatedQuote = { ...existingQuote, ...quoteData, updatedAt: now };
    this.quotes.set(id, updatedQuote);
    return updatedQuote;
  }

  async deleteQuote(id: number): Promise<boolean> {
    // Delete related quote line items first
    await this.deleteQuoteLineItemsByQuoteId(id);
    return this.quotes.delete(id);
  }

  // Quote line items methods
  async getQuoteLineItems(quoteId: number): Promise<QuoteLineItem[]> {
    return Array.from(this.quoteLineItems.values())
      .filter((item) => item.quoteId === quoteId)
      .sort((a, b) => a.position - b.position);
  }

  async createQuoteLineItem(insertLineItem: InsertQuoteLineItem): Promise<QuoteLineItem> {
    const id = this.quoteLineItemCurrentId++;
    const lineItem: QuoteLineItem = { ...insertLineItem, id };
    this.quoteLineItems.set(id, lineItem);
    return lineItem;
  }

  async updateQuoteLineItem(id: number, lineItemData: Partial<InsertQuoteLineItem>): Promise<QuoteLineItem | undefined> {
    const existingLineItem = this.quoteLineItems.get(id);
    if (!existingLineItem) {
      return undefined;
    }
    
    const updatedLineItem = { ...existingLineItem, ...lineItemData };
    this.quoteLineItems.set(id, updatedLineItem);
    return updatedLineItem;
  }

  async deleteQuoteLineItem(id: number): Promise<boolean> {
    return this.quoteLineItems.delete(id);
  }

  async deleteQuoteLineItemsByQuoteId(quoteId: number): Promise<boolean> {
    const lineItems = Array.from(this.quoteLineItems.values())
      .filter((item) => item.quoteId === quoteId);
      
    for (const item of lineItems) {
      this.quoteLineItems.delete(item.id);
    }
    
    return true;
  }

  // Invoice methods
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (invoice) => invoice.userId === userId,
    );
  }

  async getInvoicesByQuoteId(quoteId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (invoice) => invoice.quoteId === quoteId,
    );
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceCurrentId++;
    const now = new Date();
    const invoice: Invoice = { 
      ...insertInvoice, 
      id, 
      createdAt: now,
      updatedAt: now 
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const existingInvoice = this.invoices.get(id);
    if (!existingInvoice) {
      return undefined;
    }
    
    const now = new Date();
    const updatedInvoice = { ...existingInvoice, ...invoiceData, updatedAt: now };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    return this.invoices.delete(id);
  }

  // Dashboard stats
  async getDashboardStats(userId: number): Promise<{
    totalQuotes: number;
    pendingQuotes: number;
    acceptedQuotes: number;
    totalRevenue: number;
    quoteIncrease: number;
    revenueIncrease: number;
  }> {
    const userQuotes = await this.getQuotesByUserId(userId);
    const userInvoices = await this.getInvoicesByUserId(userId);
    
    const totalQuotes = userQuotes.length;
    const pendingQuotes = userQuotes.filter(q => q.status === 'sent').length;
    const acceptedQuotes = userQuotes.filter(q => q.status === 'signed').length;
    
    // Calculate total revenue from signed quotes
    const totalRevenue = userQuotes
      .filter(q => q.status === 'signed')
      .reduce((sum, quote) => {
        return sum + Number(quote.totalTTC);
      }, 0);
    
    // Placeholder growth metrics - in a real app would compare with previous period
    const quoteIncrease = 12; // 12% increase
    const revenueIncrease = 8; // 8% increase
    
    return {
      totalQuotes,
      pendingQuotes,
      acceptedQuotes,
      totalRevenue,
      quoteIncrease,
      revenueIncrease
    };
  }
}

import { db } from "./db";
import { eq } from "drizzle-orm";

// Remplacer MemStorage par DatabaseStorage
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClientsByUserId(userId: number): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.userId, userId));
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(clientData)
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async deleteClient(id: number): Promise<boolean> {
    await db.delete(clients).where(eq(clients.id, id));
    return true;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }

  async getProjectsByClientId(clientId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.clientId, clientId));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(projectData)
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: number): Promise<boolean> {
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote || undefined;
  }

  async getQuotesByUserId(userId: number): Promise<Quote[]> {
    return await db.select().from(quotes).where(eq(quotes.userId, userId));
  }

  async getQuotesByClientId(clientId: number): Promise<Quote[]> {
    return await db.select().from(quotes).where(eq(quotes.clientId, clientId));
  }

  async getQuotesByProjectId(projectId: number): Promise<Quote[]> {
    return await db.select().from(quotes).where(eq(quotes.projectId, projectId));
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await db
      .insert(quotes)
      .values(insertQuote)
      .returning();
    return quote;
  }

  async updateQuote(id: number, quoteData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [quote] = await db
      .update(quotes)
      .set(quoteData)
      .where(eq(quotes.id, id))
      .returning();
    return quote;
  }

  async deleteQuote(id: number): Promise<boolean> {
    await db.delete(quotes).where(eq(quotes.id, id));
    return true;
  }

  async getQuoteLineItems(quoteId: number): Promise<QuoteLineItem[]> {
    return await db.select().from(quoteLineItems).where(eq(quoteLineItems.quoteId, quoteId));
  }

  async createQuoteLineItem(insertLineItem: InsertQuoteLineItem): Promise<QuoteLineItem> {
    const [lineItem] = await db
      .insert(quoteLineItems)
      .values(insertLineItem)
      .returning();
    return lineItem;
  }

  async updateQuoteLineItem(id: number, lineItemData: Partial<InsertQuoteLineItem>): Promise<QuoteLineItem | undefined> {
    const [lineItem] = await db
      .update(quoteLineItems)
      .set(lineItemData)
      .where(eq(quoteLineItems.id, id))
      .returning();
    return lineItem;
  }

  async deleteQuoteLineItem(id: number): Promise<boolean> {
    await db.delete(quoteLineItems).where(eq(quoteLineItems.id, id));
    return true;
  }

  async deleteQuoteLineItemsByQuoteId(quoteId: number): Promise<boolean> {
    await db.delete(quoteLineItems).where(eq(quoteLineItems.quoteId, quoteId));
    return true;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.userId, userId));
  }

  async getInvoicesByQuoteId(quoteId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.quoteId, quoteId));
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db
      .insert(invoices)
      .values(insertInvoice)
      .returning();
    return invoice;
  }

  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [invoice] = await db
      .update(invoices)
      .set(invoiceData)
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    await db.delete(invoices).where(eq(invoices.id, id));
    return true;
  }

  async getDashboardStats(userId: number): Promise<{
    totalQuotes: number;
    pendingQuotes: number;
    acceptedQuotes: number;
    totalRevenue: number;
    quoteIncrease: number;
    revenueIncrease: number;
  }> {
    // Nous allons simuler ces statistiques pour l'instant
    return {
      totalQuotes: 4,
      pendingQuotes: 1,
      acceptedQuotes: 2,
      totalRevenue: 5750,
      quoteIncrease: 25,
      revenueIncrease: 15
    };
  }
}

export const storage = new DatabaseStorage();

// Initialize demo data
(async () => {
  const demoUser = await storage.getUserByUsername("demo");
  if (!demoUser) return;
  
  const userId = demoUser.id;
  
  // Create demo clients
  const client1 = await storage.createClient({
    userId,
    type: "company",
    companyName: "Dupont Construction",
    firstName: "Jean",
    lastName: "Dupont",
    email: "contact@dupont-construction.fr",
    phone: "01 23 45 67 89",
    address: "123 Rue de la Construction",
    city: "Paris",
    zipCode: "75001",
    country: "France",
    siret: "123 456 789 00012",
    notes: ""
  });
  
  const client2 = await storage.createClient({
    userId,
    type: "company",
    companyName: "Martin Rénovation",
    firstName: "Sophie",
    lastName: "Martin",
    email: "info@martin-renovation.com",
    phone: "01 98 76 54 32",
    address: "456 Avenue des Travaux",
    city: "Lyon",
    zipCode: "69001",
    country: "France",
    siret: "987 654 321 00012",
    notes: ""
  });
  
  const client3 = await storage.createClient({
    userId,
    type: "company",
    companyName: "Dubois et Fils",
    firstName: "Pierre",
    lastName: "Dubois",
    email: "contact@duboisetfils.fr",
    phone: "01 45 67 89 01",
    address: "789 Boulevard du Bâtiment",
    city: "Marseille",
    zipCode: "13001",
    country: "France",
    siret: "456 789 123 00012",
    notes: ""
  });
  
  const client4 = await storage.createClient({
    userId,
    type: "company",
    companyName: "Lambert Construction",
    firstName: "Marie",
    lastName: "Lambert",
    email: "contact@lambert-construction.fr",
    phone: "01 67 89 01 23",
    address: "321 Rue de l'Artisan",
    city: "Bordeaux",
    zipCode: "33000",
    country: "France",
    siret: "789 123 456 00012",
    notes: ""
  });
  
  // Create demo projects
  const project1 = await storage.createProject({
    userId,
    clientId: client1.id,
    name: "Rénovation appartement Nantes",
    description: "Rénovation complète d'un appartement de 80m²",
    address: "10 Rue de la Loire",
    city: "Nantes",
    zipCode: "44000",
    country: "France",
    startDate: new Date("2023-05-15"),
    endDate: new Date("2023-06-30"),
    progress: 35
  });
  
  const project2 = await storage.createProject({
    userId,
    clientId: client2.id,
    name: "Construction extension Paris",
    description: "Construction d'une extension de 30m² pour une maison individuelle",
    address: "25 Rue de la Seine",
    city: "Paris",
    zipCode: "75015",
    country: "France",
    startDate: new Date("2023-05-01"),
    endDate: new Date("2023-08-15"),
    progress: 20
  });
  
  const project3 = await storage.createProject({
    userId,
    clientId: client3.id,
    name: "Réfection toiture Lyon",
    description: "Réfection complète d'une toiture de 120m²",
    address: "42 Rue du Rhône",
    city: "Lyon",
    zipCode: "69002",
    country: "France",
    startDate: new Date("2023-04-25"),
    endDate: new Date("2023-05-25"),
    progress: 75
  });
  
  const project4 = await storage.createProject({
    userId,
    clientId: client4.id,
    name: "Plomberie bâtiment Marseille",
    description: "Installation complète de la plomberie pour un immeuble de 10 logements",
    address: "18 Avenue de la Mer",
    city: "Marseille",
    zipCode: "13008",
    country: "France",
    startDate: new Date("2023-05-10"),
    endDate: new Date("2023-05-20"),
    progress: 50
  });
  
  // Create demo quotes
  const quote1 = await storage.createQuote({
    userId,
    clientId: client1.id,
    projectId: project1.id,
    number: "DEVIS-2023-042",
    status: "signed",
    issueDate: new Date("2023-05-12"),
    validUntil: new Date("2023-06-12"),
    notes: "Devis validé par le client",
    conditions: "Paiement : 30% à la commande, 70% à la livraison\nValidité du devis : 30 jours",
    totalHT: "4041.67",
    totalTVA: "808.33",
    totalTTC: "4850.00",
    deposit: "1455.00",
    depositPercent: 30
  });
  
  const quote2 = await storage.createQuote({
    userId,
    clientId: client2.id,
    projectId: project2.id,
    number: "DEVIS-2023-041",
    status: "sent",
    issueDate: new Date("2023-05-10"),
    validUntil: new Date("2023-06-10"),
    notes: "Devis envoyé par email le 10/05/2023",
    conditions: "Paiement : 30% à la commande, 70% à la livraison\nValidité du devis : 30 jours",
    totalHT: "1975.00",
    totalTVA: "395.00",
    totalTTC: "2370.00",
    deposit: "711.00",
    depositPercent: 30
  });
  
  const quote3 = await storage.createQuote({
    userId,
    clientId: client3.id,
    projectId: project3.id,
    number: "DEVIS-2023-040",
    status: "draft",
    issueDate: new Date("2023-05-08"),
    validUntil: new Date("2023-06-08"),
    notes: "Devis en cours de préparation",
    conditions: "Paiement : 30% à la commande, 70% à la livraison\nValidité du devis : 30 jours",
    totalHT: "7433.33",
    totalTVA: "1486.67",
    totalTTC: "8920.00",
    deposit: "2676.00",
    depositPercent: 30
  });
  
  const quote4 = await storage.createQuote({
    userId,
    clientId: client4.id,
    projectId: project4.id,
    number: "DEVIS-2023-039",
    status: "rejected",
    issueDate: new Date("2023-05-05"),
    validUntil: new Date("2023-06-05"),
    notes: "Devis refusé par le client : budget trop élevé",
    conditions: "Paiement : 30% à la commande, 70% à la livraison\nValidité du devis : 30 jours",
    totalHT: "2875.00",
    totalTVA: "575.00",
    totalTTC: "3450.00",
    deposit: "1035.00",
    depositPercent: 30
  });
  
  // Create quote line items for quote 1
  await storage.createQuoteLineItem({
    quoteId: quote1.id,
    type: "title",
    title: "Travaux de rénovation",
    description: null,
    quantity: null,
    unit: null,
    unitPrice: null,
    vatRate: null,
    totalHT: null,
    position: 1
  });
  
  await storage.createQuoteLineItem({
    quoteId: quote1.id,
    type: "subtitle",
    title: "Préparation et démolition",
    description: null,
    quantity: null,
    unit: null,
    unitPrice: null,
    vatRate: null,
    totalHT: null,
    position: 2
  });
  
  await storage.createQuoteLineItem({
    quoteId: quote1.id,
    type: "labor",
    title: "Main d'œuvre démolition",
    description: "Démolition des cloisons existantes et évacuation des gravats",
    quantity: "20",
    unit: "h",
    unitPrice: "45",
    vatRate: "20",
    totalHT: "900",
    position: 3
  });
  
  await storage.createQuoteLineItem({
    quoteId: quote1.id,
    type: "material",
    title: "Bennes à déchets",
    description: "Location de bennes pour évacuation des déchets",
    quantity: "2",
    unit: "unité",
    unitPrice: "180",
    vatRate: "20",
    totalHT: "360",
    position: 4
  });
  
  await storage.createQuoteLineItem({
    quoteId: quote1.id,
    type: "subtitle",
    title: "Plâtrerie",
    description: null,
    quantity: null,
    unit: null,
    unitPrice: null,
    vatRate: null,
    totalHT: null,
    position: 5
  });
  
  await storage.createQuoteLineItem({
    quoteId: quote1.id,
    type: "material",
    title: "Plaques de plâtre BA13",
    description: "Fourniture de plaques de plâtre standard 2,5 x 1,2 m",
    quantity: "25",
    unit: "m²",
    unitPrice: "12",
    vatRate: "20",
    totalHT: "300",
    position: 6
  });
  
  await storage.createQuoteLineItem({
    quoteId: quote1.id,
    type: "labor",
    title: "Pose des plaques de plâtre",
    description: "Montage des cloisons et pose des plaques",
    quantity: "24",
    unit: "h",
    unitPrice: "45",
    vatRate: "20",
    totalHT: "1080",
    position: 7
  });
  
  await storage.createQuoteLineItem({
    quoteId: quote1.id,
    type: "subtitle",
    title: "Peinture",
    description: null,
    quantity: null,
    unit: null,
    unitPrice: null,
    vatRate: null,
    totalHT: null,
    position: 8
  });
  
  await storage.createQuoteLineItem({
    quoteId: quote1.id,
    type: "material",
    title: "Peinture blanche mate",
    description: "Peinture professionnelle haute qualité",
    quantity: "40",
    unit: "m²",
    unitPrice: "6",
    vatRate: "20",
    totalHT: "240",
    position: 9
  });
  
  await storage.createQuoteLineItem({
    quoteId: quote1.id,
    type: "labor",
    title: "Application peinture",
    description: "Préparation des surfaces et application de 2 couches",
    quantity: "30",
    unit: "h",
    unitPrice: "40",
    vatRate: "20",
    totalHT: "1200",
    position: 10
  });
  
  // Create an invoice for the signed quote
  await storage.createInvoice({
    userId,
    quoteId: quote1.id,
    clientId: client1.id,
    projectId: project1.id,
    number: "FACTURE-2023-042",
    type: "deposit",
    status: "pending",
    issueDate: new Date("2023-05-15"),
    dueDate: new Date("2023-05-30"),
    totalHT: "1212.50",
    totalTVA: "242.50",
    totalTTC: "1455.00",
    paidAmount: "0"
  });
})();
