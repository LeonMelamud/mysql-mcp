#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

type Note = { title: string, content: string };

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// Initialize database table
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL
      )
    `);
    connection.release();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

const server = new Server(
  {
    name: "mysql-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const [rows] = await pool.execute('SELECT id, title FROM notes');
  return {
    resources: (rows as any[]).map(note => ({
      uri: `note:///${note.id}`,
      mimeType: "text/plain",
      name: note.title,
      description: `A text note: ${note.title}`
    }))
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  const id = url.pathname.replace(/^\//, '');
  
  const [rows] = await pool.execute('SELECT * FROM notes WHERE id = ?', [id]);
  const notes = rows as any[];
  
  if (notes.length === 0) {
    throw new Error(`Note ${id} not found`);
  }

  return {
    contents: [{
      uri: request.params.uri,
      mimeType: "text/plain",
      text: notes[0].content
    }]
  };
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_note",
        description: "Create a new note",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the note"
            },
            content: {
              type: "string",
              description: "Text content of the note"
            }
          },
          required: ["title", "content"]
        }
      },
      {
        name: "list_tables",
        description: "List all tables in the database",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "count_tables",
        description: "Get the total number of tables in the database",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "search_tables",
        description: "Search for tables using LIKE pattern",
        inputSchema: {
          type: "object",
          properties: {
            pattern: {
              type: "string",
              description: "LIKE pattern to search for (e.g. '%bill%')"
            }
          },
          required: ["pattern"]
        }
      },
      {
        name: "describe_table",
        description: "Get the structure of a table",
        inputSchema: {
          type: "object",
          properties: {
            table: {
              type: "string",
              description: "Name of the table to describe"
            }
          },
          required: ["table"]
        }
      },
      {
        name: "execute_sql",
        description: "Execute a SQL query",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "SQL query to execute"
            },
            params: {
              type: "array",
              description: "Query parameters (optional)",
              items: {
                type: "string"
              }
            }
          },
          required: ["query"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "create_note": {
      const title = String(request.params.arguments?.title);
      const content = String(request.params.arguments?.content);
      if (!title || !content) {
        throw new Error("Title and content are required");
      }

      const [result] = await pool.execute(
        'INSERT INTO notes (title, content) VALUES (?, ?)',
        [title, content]
      );
      const id = (result as any).insertId;

      return {
        content: [{
          type: "text",
          text: `Created note ${id}: ${title}`
        }]
      };
    }

    case "list_tables": {
      const [rows] = await pool.execute('SHOW TABLES');
      const tables = (rows as any[]).map(row => Object.values(row)[0]);

      return {
        content: [{
          type: "text",
          text: `Tables in database:\n${tables.join('\n')}`
        }]
      };
    }

    case "count_tables": {
      try {
        const [rows] = await pool.execute('SHOW TABLES');
        const count = (rows as any[]).length;

        return {
          content: [{
            type: "text",
            text: `Total number of tables: ${count}`
          }]
        };
      } catch (error: any) {
        const errorMessage = error?.message || 'Unknown error occurred';
        throw new Error(`Failed to count tables: ${errorMessage}`);
      }
    }

    case "search_tables": {
      const pattern = String(request.params.arguments?.pattern);
      if (!pattern) {
        throw new Error("Search pattern is required");
      }

      const [rows] = await pool.execute('SHOW TABLES WHERE Tables_in_' + process.env.MYSQL_DATABASE + ' LIKE ?', [pattern]);
      const tables = (rows as any[]).map(row => Object.values(row)[0]);

      return {
        content: [{
          type: "text",
          text: `Tables matching pattern '${pattern}':\n${tables.join('\n')}`
        }]
      };
    }

    case "describe_table": {
      const table = String(request.params.arguments?.table);
      if (!table) {
        throw new Error("Table name is required");
      }

      // First verify the table exists
      const [tables] = await pool.execute('SHOW TABLES');
      const tableExists = (tables as any[]).some(row => Object.values(row)[0] === table);
      
      if (!tableExists) {
        throw new Error(`Table '${table}' does not exist`);
      }

      // Get table structure
      const [rows] = await pool.execute(`DESCRIBE ${table}`);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(rows, null, 2)
        }]
      };
    }

    case "execute_sql": {
      const query = String(request.params.arguments?.query);
      const params = request.params.arguments?.params || [];
      
      if (!query) {
        throw new Error("SQL query is required");
      }

      try {
        // Execute the query with optional parameters
        const [result] = await pool.execute(query, params);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error: any) {
        const errorMessage = error?.message || 'Unknown error occurred';
        throw new Error(`Failed to execute SQL: ${errorMessage}`);
      }
    }

    default:
      throw new Error("Unknown tool");
  }
});

async function main() {
  try {
    await initDatabase();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MySQL MCP server running on stdio');
  } catch (error) {
    console.error("Server error:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
