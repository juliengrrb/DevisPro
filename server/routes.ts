import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  insertUserSchema, 
  insertClientSchema, 
  insertProjectSchema, 
  insertQuoteSchema, 
  insertQuoteLineItemSchema,
  insertInvoiceSchema
} from "@shared/schema";
import { generateQuotePdf } from "./lib/pdf-generator";
import { sendQuoteEmail } from "./lib/email-sender";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for validation errors
  app.use((err: any, req: Request, res: Response, next: any) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({
        error: validationError.message
      });
    }
    next(err);
  });

  // Dashboard
  app.get("/api/dashboard/stats", async (req, res) => {
    // For demo, use the demo user with ID 1
    const userId = 1;
    
    try {
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      res.status(500).json({ error: "Failed to get dashboard statistics" });
    }
  });
  
  // Users
  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't send the password field
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });
  
  app.put("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    
    try {
      const updateData = insertUserSchema.omit({ password: true }).parse(req.body);
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't send the password field
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  
  // Clients
  app.get("/api/clients", async (req, res) => {
    // For demo, use the demo user with ID 1
    const userId = 1;
    
    try {
      const clients = await storage.getClientsByUserId(userId);
      res.json(clients);
    } catch (error) {
      console.error("Error getting clients:", error);
      res.status(500).json({ error: "Failed to get clients" });
    }
  });
  
  app.get("/api/clients/:id", async (req, res) => {
    const clientId = parseInt(req.params.id);
    try {
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error getting client:", error);
      res.status(500).json({ error: "Failed to get client" });
    }
  });
  
  app.post("/api/clients", async (req, res) => {
    // For demo, use the demo user with ID 1
    const userId = 1;
    
    try {
      const clientData = insertClientSchema.parse({
        ...req.body,
        userId
      });
      
      const newClient = await storage.createClient(clientData);
      res.status(201).json(newClient);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      console.error("Error creating client:", error);
      res.status(500).json({ error: "Failed to create client" });
    }
  });
  
  app.put("/api/clients/:id", async (req, res) => {
    const clientId = parseInt(req.params.id);
    
    try {
      // For demo, use the demo user with ID 1
      const userId = 1;
      
      // Ensure the user ID is preserved
      const updateData = insertClientSchema.omit({ userId: true }).parse(req.body);
      const updatedClient = await storage.updateClient(clientId, { ...updateData, userId });
      
      if (!updatedClient) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.json(updatedClient);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      console.error("Error updating client:", error);
      res.status(500).json({ error: "Failed to update client" });
    }
  });
  
  app.delete("/api/clients/:id", async (req, res) => {
    const clientId = parseInt(req.params.id);
    try {
      const success = await storage.deleteClient(clientId);
      if (!success) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ error: "Failed to delete client" });
    }
  });
  
  // Projects
  app.get("/api/projects", async (req, res) => {
    // For demo, use the demo user with ID 1
    const userId = 1;
    
    try {
      const projects = await storage.getProjectsByUserId(userId);
      
      // Get client details for each project
      const projectsWithClientDetails = await Promise.all(
        projects.map(async (project) => {
          const client = await storage.getClient(project.clientId);
          return {
            ...project,
            client: client ? {
              id: client.id,
              name: client.type === "company" ? client.companyName : `${client.firstName} ${client.lastName}`,
              email: client.email
            } : null
          };
        })
      );
      
      res.json(projectsWithClientDetails);
    } catch (error) {
      console.error("Error getting projects:", error);
      res.status(500).json({ error: "Failed to get projects" });
    }
  });
  
  app.get("/api/projects/:id", async (req, res) => {
    const projectId = parseInt(req.params.id);
    try {
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const client = await storage.getClient(project.clientId);
      
      res.json({
        ...project,
        client: client ? {
          id: client.id,
          name: client.type === "company" ? client.companyName : `${client.firstName} ${client.lastName}`,
          email: client.email
        } : null
      });
    } catch (error) {
      console.error("Error getting project:", error);
      res.status(500).json({ error: "Failed to get project" });
    }
  });
  
  app.get("/api/clients/:clientId/projects", async (req, res) => {
    const clientId = parseInt(req.params.clientId);
    try {
      const projects = await storage.getProjectsByClientId(clientId);
      res.json(projects);
    } catch (error) {
      console.error("Error getting client projects:", error);
      res.status(500).json({ error: "Failed to get client projects" });
    }
  });
  
  app.post("/api/projects", async (req, res) => {
    // For demo, use the demo user with ID 1
    const userId = 1;
    
    try {
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId
      });
      
      const newProject = await storage.createProject(projectData);
      res.status(201).json(newProject);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });
  
  app.put("/api/projects/:id", async (req, res) => {
    const projectId = parseInt(req.params.id);
    
    try {
      // For demo, use the demo user with ID 1
      const userId = 1;
      
      // Ensure the user ID is preserved
      const updateData = insertProjectSchema.omit({ userId: true }).parse(req.body);
      const updatedProject = await storage.updateProject(projectId, { ...updateData, userId });
      
      if (!updatedProject) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });
  
  app.delete("/api/projects/:id", async (req, res) => {
    const projectId = parseInt(req.params.id);
    try {
      const success = await storage.deleteProject(projectId);
      if (!success) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });
  
  // Quotes
  app.get("/api/quotes", async (req, res) => {
    // For demo, use the demo user with ID 1
    const userId = 1;
    
    try {
      const quotes = await storage.getQuotesByUserId(userId);
      
      // Get client and project details for each quote
      const quotesWithDetails = await Promise.all(
        quotes.map(async (quote) => {
          const client = await storage.getClient(quote.clientId);
          const project = quote.projectId ? await storage.getProject(quote.projectId) : null;
          
          return {
            ...quote,
            client: client ? {
              id: client.id,
              name: client.type === "company" ? client.companyName : `${client.firstName} ${client.lastName}`,
              email: client.email
            } : null,
            project: project ? {
              id: project.id,
              name: project.name
            } : null
          };
        })
      );
      
      res.json(quotesWithDetails);
    } catch (error) {
      console.error("Error getting quotes:", error);
      res.status(500).json({ error: "Failed to get quotes" });
    }
  });
  
  app.get("/api/quotes/:id", async (req, res) => {
    const quoteId = parseInt(req.params.id);
    try {
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      
      const client = await storage.getClient(quote.clientId);
      const project = quote.projectId ? await storage.getProject(quote.projectId) : null;
      const lineItems = await storage.getQuoteLineItems(quoteId);
      
      res.json({
        ...quote,
        client: client ? {
          id: client.id,
          name: client.type === "company" ? client.companyName : `${client.firstName} ${client.lastName}`,
          email: client.email,
          address: client.address,
          city: client.city,
          zipCode: client.zipCode,
          country: client.country,
          type: client.type,
          firstName: client.firstName,
          lastName: client.lastName,
          companyName: client.companyName,
          siret: client.siret,
          phone: client.phone
        } : null,
        project: project ? {
          id: project.id,
          name: project.name,
          address: project.address,
          city: project.city,
          zipCode: project.zipCode,
          country: project.country,
          description: project.description
        } : null,
        lineItems
      });
    } catch (error) {
      console.error("Error getting quote:", error);
      res.status(500).json({ error: "Failed to get quote" });
    }
  });
  
  app.post("/api/quotes", async (req, res) => {
    // For demo, use the demo user with ID 1
    const userId = 1;
    
    try {
      const quoteData = insertQuoteSchema.parse({
        ...req.body,
        userId
      });
      
      const newQuote = await storage.createQuote(quoteData);
      
      // Create line items if provided
      if (req.body.lineItems && Array.isArray(req.body.lineItems)) {
        for (const item of req.body.lineItems) {
          await storage.createQuoteLineItem({
            ...item,
            quoteId: newQuote.id
          });
        }
      }
      
      res.status(201).json(newQuote);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      console.error("Error creating quote:", error);
      res.status(500).json({ error: "Failed to create quote" });
    }
  });
  
  app.put("/api/quotes/:id", async (req, res) => {
    const quoteId = parseInt(req.params.id);
    
    try {
      // For demo, use the demo user with ID 1
      const userId = 1;
      
      // Get and validate the quote data
      const { lineItems, ...quoteData } = req.body;
      const validatedQuoteData = insertQuoteSchema
        .omit({ userId: true })
        .parse(quoteData);
      
      // Update the quote
      const updatedQuote = await storage.updateQuote(quoteId, { 
        ...validatedQuoteData, 
        userId 
      });
      
      if (!updatedQuote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      
      // Handle line items if provided
      if (lineItems && Array.isArray(lineItems)) {
        // Delete existing line items for this quote
        await storage.deleteQuoteLineItemsByQuoteId(quoteId);
        
        // Create new line items
        for (const item of lineItems) {
          const validatedLineItem = insertQuoteLineItemSchema
            .omit({ quoteId: true })
            .parse(item);
            
          await storage.createQuoteLineItem({
            ...validatedLineItem,
            quoteId
          });
        }
      }
      
      // Get the complete updated quote with line items
      const quote = await storage.getQuote(quoteId);
      const lineItemsUpdated = await storage.getQuoteLineItems(quoteId);
      
      res.json({
        ...quote,
        lineItems: lineItemsUpdated
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      console.error("Error updating quote:", error);
      res.status(500).json({ error: "Failed to update quote" });
    }
  });
  
  app.delete("/api/quotes/:id", async (req, res) => {
    const quoteId = parseInt(req.params.id);
    try {
      const success = await storage.deleteQuote(quoteId);
      if (!success) {
        return res.status(404).json({ error: "Quote not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting quote:", error);
      res.status(500).json({ error: "Failed to delete quote" });
    }
  });
  
  // Quote line items
  app.get("/api/quotes/:quoteId/line-items", async (req, res) => {
    const quoteId = parseInt(req.params.quoteId);
    try {
      const lineItems = await storage.getQuoteLineItems(quoteId);
      res.json(lineItems);
    } catch (error) {
      console.error("Error getting quote line items:", error);
      res.status(500).json({ error: "Failed to get quote line items" });
    }
  });
  
  app.post("/api/quotes/:quoteId/line-items", async (req, res) => {
    const quoteId = parseInt(req.params.quoteId);
    
    try {
      // Check if the quote exists
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      
      const lineItemData = insertQuoteLineItemSchema.parse({
        ...req.body,
        quoteId
      });
      
      const newLineItem = await storage.createQuoteLineItem(lineItemData);
      res.status(201).json(newLineItem);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      console.error("Error creating quote line item:", error);
      res.status(500).json({ error: "Failed to create quote line item" });
    }
  });
  
  app.put("/api/quote-line-items/:id", async (req, res) => {
    const lineItemId = parseInt(req.params.id);
    
    try {
      const lineItemData = insertQuoteLineItemSchema.omit({ quoteId: true }).parse(req.body);
      const updatedLineItem = await storage.updateQuoteLineItem(lineItemId, lineItemData);
      
      if (!updatedLineItem) {
        return res.status(404).json({ error: "Quote line item not found" });
      }
      
      res.json(updatedLineItem);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      console.error("Error updating quote line item:", error);
      res.status(500).json({ error: "Failed to update quote line item" });
    }
  });
  
  app.delete("/api/quote-line-items/:id", async (req, res) => {
    const lineItemId = parseInt(req.params.id);
    try {
      const success = await storage.deleteQuoteLineItem(lineItemId);
      if (!success) {
        return res.status(404).json({ error: "Quote line item not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting quote line item:", error);
      res.status(500).json({ error: "Failed to delete quote line item" });
    }
  });
  
  // Generate PDF
  app.get("/api/quotes/:id/pdf", async (req, res) => {
    const quoteId = parseInt(req.params.id);
    
    try {
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      
      const client = await storage.getClient(quote.clientId);
      const project = quote.projectId ? await storage.getProject(quote.projectId) : null;
      const lineItems = await storage.getQuoteLineItems(quoteId);
      const user = await storage.getUser(quote.userId);
      
      if (!client || !user) {
        return res.status(404).json({ error: "Client or company information not found" });
      }
      
      const pdfBuffer = await generateQuotePdf({
        quote,
        client,
        project,
        lineItems,
        company: user
      });
      
      res.contentType("application/pdf");
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });
  
  // Send quote by email
  app.post("/api/quotes/:id/send", async (req, res) => {
    const quoteId = parseInt(req.params.id);
    const { email, subject, message } = req.body;
    
    // Validate input
    const emailSchema = z.object({
      email: z.string().email(),
      subject: z.string().min(1),
      message: z.string().min(1)
    });
    
    try {
      const validatedData = emailSchema.parse({ email, subject, message });
      
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      
      const client = await storage.getClient(quote.clientId);
      const project = quote.projectId ? await storage.getProject(quote.projectId) : null;
      const lineItems = await storage.getQuoteLineItems(quoteId);
      const user = await storage.getUser(quote.userId);
      
      if (!client || !user) {
        return res.status(404).json({ error: "Client or company information not found" });
      }
      
      // Generate PDF for attachment
      const pdfBuffer = await generateQuotePdf({
        quote,
        client,
        project,
        lineItems,
        company: user
      });
      
      // Send email
      await sendQuoteEmail({
        to: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        pdfBuffer,
        quoteName: quote.number,
        senderName: user.companyName || "DevisPro BTP",
        senderEmail: user.email || "no-reply@devispro-btp.com"
      });
      
      // Update quote status to 'sent' if it was in draft
      if (quote.status === 'draft') {
        await storage.updateQuote(quoteId, { status: 'sent' });
      }
      
      res.json({ success: true, message: "Quote sent successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      console.error("Error sending quote:", error);
      res.status(500).json({ error: "Failed to send quote" });
    }
  });
  
  // Invoices
  app.get("/api/invoices", async (req, res) => {
    // For demo, use the demo user with ID 1
    const userId = 1;
    
    try {
      const invoices = await storage.getInvoicesByUserId(userId);
      
      // Get client and quote details for each invoice
      const invoicesWithDetails = await Promise.all(
        invoices.map(async (invoice) => {
          const client = await storage.getClient(invoice.clientId);
          const quote = await storage.getQuote(invoice.quoteId);
          
          return {
            ...invoice,
            client: client ? {
              id: client.id,
              name: client.type === "company" ? client.companyName : `${client.firstName} ${client.lastName}`,
              email: client.email
            } : null,
            quote: quote ? {
              id: quote.id,
              number: quote.number
            } : null
          };
        })
      );
      
      res.json(invoicesWithDetails);
    } catch (error) {
      console.error("Error getting invoices:", error);
      res.status(500).json({ error: "Failed to get invoices" });
    }
  });
  
  app.get("/api/invoices/:id", async (req, res) => {
    const invoiceId = parseInt(req.params.id);
    try {
      const invoice = await storage.getInvoice(invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      const client = await storage.getClient(invoice.clientId);
      const quote = await storage.getQuote(invoice.quoteId);
      const project = invoice.projectId ? await storage.getProject(invoice.projectId) : null;
      
      res.json({
        ...invoice,
        client: client ? {
          id: client.id,
          name: client.type === "company" ? client.companyName : `${client.firstName} ${client.lastName}`,
          email: client.email,
          address: client.address,
          city: client.city,
          zipCode: client.zipCode,
          country: client.country
        } : null,
        quote: quote ? {
          id: quote.id,
          number: quote.number
        } : null,
        project: project ? {
          id: project.id,
          name: project.name
        } : null
      });
    } catch (error) {
      console.error("Error getting invoice:", error);
      res.status(500).json({ error: "Failed to get invoice" });
    }
  });
  
  app.post("/api/quotes/:quoteId/invoices", async (req, res) => {
    const quoteId = parseInt(req.params.quoteId);
    
    try {
      // For demo, use the demo user with ID 1
      const userId = 1;
      
      // Get the quote
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      
      // Check if the quote is signed
      if (quote.status !== 'signed') {
        return res.status(400).json({ error: "Cannot create an invoice from a quote that is not signed" });
      }
      
      // Get the request data with validation
      const invoiceData = insertInvoiceSchema.parse({
        ...req.body,
        userId,
        quoteId,
        clientId: quote.clientId,
        projectId: quote.projectId
      });
      
      const newInvoice = await storage.createInvoice(invoiceData);
      res.status(201).json(newInvoice);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });
  
  app.put("/api/invoices/:id", async (req, res) => {
    const invoiceId = parseInt(req.params.id);
    
    try {
      // For demo, use the demo user with ID 1
      const userId = 1;
      
      // Ensure user ID, quote ID, and client ID are preserved
      const updateData = insertInvoiceSchema
        .omit({ userId: true, quoteId: true, clientId: true })
        .parse(req.body);
        
      const updatedInvoice = await storage.updateInvoice(invoiceId, updateData);
      
      if (!updatedInvoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      res.json(updatedInvoice);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      console.error("Error updating invoice:", error);
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });
  
  app.delete("/api/invoices/:id", async (req, res) => {
    const invoiceId = parseInt(req.params.id);
    try {
      const success = await storage.deleteInvoice(invoiceId);
      if (!success) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ error: "Failed to delete invoice" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
