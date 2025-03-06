# MySQL MCP Server

A powerful MCP server that provides direct access to MySQL databases. This server enables AI agents to interact with MySQL databases, execute SQL queries, and manage database content through a simple interface.

## Features

### Resources
- Access notes stored in the database via `note:///{id}` URIs
- Each note has a title and content
- Plain text mime type for simple content access

### Tools
- `create_note` - Create new text notes in the database
  - Takes title and content as required parameters
  - Stores note in the MySQL database
- `list_tables` - List all tables in the connected database
- `count_tables` - Get the total number of tables in the database
- `search_tables` - Search for tables using LIKE pattern
- `describe_table` - Get the structure of a specific table
- `execute_sql` - Execute custom SQL queries

## Prerequisites

- Node.js 18 or higher
- MySQL server installed and running
- A database with appropriate permissions

## Setup

1. Clone this repository:
   ```bash
   git clone git@github.com:LeonMelamud/mysql-mcp.git
   cd mysql-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your MySQL connection details:
   ```
   MYSQL_HOST=localhost
   MYSQL_USER=your_username
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=your_database
   ```

4. Build the server:
   ```bash
   npm run build
   ```

## Installation

### For Claude Desktop

Add the server config to your Claude Desktop configuration file:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["/path/to/mysql-server/build/index.js"],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_USER": "your_username",
        "MYSQL_PASSWORD": "your_password",
        "MYSQL_DATABASE": "your_database"
      }
    }
  }
}
```

### For Cline

Add the server config to your Cline MCP settings file:

On MacOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
On Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["/path/to/mysql-server/build/index.js"],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_USER": "your_username",
        "MYSQL_PASSWORD": "your_password",
        "MYSQL_DATABASE": "your_database"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Usage Examples

Once installed, you can use the MySQL MCP server in your conversations with Claude:

### List all tables in the database
```
Please list all the tables in my MySQL database.
```

### Execute a SQL query
```
Run this SQL query: SELECT * FROM users LIMIT 5
```

### Create a note
```
Create a note titled "Meeting Notes" with the content "Discussed project timeline and assigned tasks."
```

## Development

For development with auto-rebuild:
```bash
npm run watch
```

### Debugging

Use the MCP Inspector to debug the server:
```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.

## License

MIT
