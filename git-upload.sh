#!/bin/bash

# Initialize Git repository (if not already done)
if [ ! -d .git ]; then
  echo "Initializing Git repository..."
  git init
else
  echo "Git repository already initialized."
fi

# Add all files to the repository
echo "Adding files to Git repository..."
git add .

# Commit the changes
echo "Committing changes..."
git commit -m "Initial commit of MySQL MCP server"

# Set the remote origin to the GitHub repository
echo "Setting remote origin..."
git remote add origin git@github.com:LeonMelamud/mysql-mcp.git

# Get the current branch name
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "main")
if [ "$BRANCH" = "" ]; then
  BRANCH="main"
fi

# Push the changes to GitHub
echo "Pushing to GitHub on branch $BRANCH..."
git push -u origin $BRANCH

echo "Done! Repository uploaded to GitHub."
