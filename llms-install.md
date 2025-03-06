# MySQL MCP Server Installation Guide for AI Agents

This guide provides specific instructions for AI agents like Cline to help users install and configure the MySQL MCP server.

## Prerequisites

Before installing this MCP server, ensure the user has:

1. Node.js 18 or higher installed
2. A MySQL server installed and running
3. A database with appropriate permissions
4. The necessary database credentials (host, username, password, database name)

## Installation Steps

1. First, check if the user has a MySQL server running:
   ```bash
   mysql --version
   ```

2. If MySQL is not installed, guide the user to install it based on their operating system.

3. Clone the repository:
   ```bash
   git clone git@github.com:LeonMelamud/mysql-mcp.git
   cd mysql-mcp
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Create a `.env` file with the MySQL connection details:
   ```
   MYSQL_HOST=localhost
   MYSQL_USER=username
   MYSQL_PASSWORD=password
   MYSQL_DATABASE=database_name
   ```

6. Build the server:
   ```bash
   npm run build
   ```

7. Add the server configuration to the appropriate config file:

   For Claude Desktop:
   ```json
   {
     "mcpServers": {
       "mysql": {
         "command": "node",
         "args": ["/absolute/path/to/mysql-mcp/build/index.js"],
         "env": {
           "MYSQL_HOST": "localhost",
           "MYSQL_USER": "username",
           "MYSQL_PASSWORD": "password",
           "MYSQL_DATABASE": "database_name"
         }
       }
     }
   }
   ```

   For Cline:
   ```json
   {
     "mcpServers": {
       "mysql": {
         "command": "node",
         "args": ["/absolute/path/to/mysql-mcp/build/index.js"],
         "env": {
           "MYSQL_HOST": "localhost",
           "MYSQL_USER": "username",
           "MYSQL_PASSWORD": "password",
           "MYSQL_DATABASE": "database_name"
         },
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

## Troubleshooting

If the user encounters issues:

1. Verify MySQL is running:
   ```bash
   sudo systemctl status mysql    # For Linux
   brew services list             # For macOS
   ```

2. Test the MySQL connection:
   ```bash
   mysql -u username -p -h localhost database_name
   ```

3. Check the .env file has the correct credentials

4. Ensure the build directory exists and contains the compiled JavaScript files:
   ```bash
   ls -la build/
   ```

5. Try running the server directly to see any error messages:
   ```bash
   node build/index.js
   ```

## Testing the Installation

Once installed, you can verify the installation by asking the user to:

1. Restart Cline or Claude Desktop
2. Ask you to list all tables in their database
3. Create a test note
4. Access the created note

Example commands to test:
```
Please list all tables in my MySQL database.
Create a note titled "Test Note" with content "This is a test note."
Show me the note I just created.
```
