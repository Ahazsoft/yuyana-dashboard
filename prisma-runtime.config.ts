import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Get the database connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create a connection pool with proper Supabase configuration
const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  },
  // Additional connection options for stability with Supabase
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 20, // Maximum number of clients in the pool
});

// Create the PrismaPg adapter
const adapter = new PrismaPg(pool);

// Export the adapter as the default export
export default { adapter };