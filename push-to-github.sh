#!/bin/bash

# 🚀 Script to push Vietnamese OCR App to GitHub
# 
# Usage: 
# 1. Create a new repository on GitHub (don't add README or .gitignore)
# 2. Copy the repository URL
# 3. Run: ./push-to-github.sh <your-github-repo-url>
#
# Example:
# ./push-to-github.sh https://github.com/yourusername/vietnamese-ocr-app.git

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if repository URL is provided
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Error: Please provide your GitHub repository URL${NC}"
    echo -e "${YELLOW}Usage: ./push-to-github.sh <github-repo-url>${NC}"
    echo -e "${YELLOW}Example: ./push-to-github.sh https://github.com/yourusername/vietnamese-ocr-app.git${NC}"
    exit 1
fi

REPO_URL=$1

echo -e "${BLUE}🚀 Pushing Vietnamese OCR App to GitHub...${NC}"
echo -e "${BLUE}Repository: ${REPO_URL}${NC}"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

# Check if there are any commits
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: No commits found. Please commit your changes first.${NC}"
    exit 1
fi

# Set the main branch
echo -e "${YELLOW}📝 Setting main branch...${NC}"
git branch -M main

# Add remote origin
echo -e "${YELLOW}🔗 Adding remote origin...${NC}"
git remote add origin "$REPO_URL" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Remote origin already exists, updating...${NC}"
    git remote set-url origin "$REPO_URL"
}

# Push to GitHub
echo -e "${YELLOW}⬆️  Pushing to GitHub...${NC}"
if git push -u origin main; then
    echo ""
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
    echo ""
    echo -e "${GREEN}🎉 Your Vietnamese OCR App is now available at:${NC}"
    echo -e "${BLUE}${REPO_URL}${NC}"
    echo ""
    echo -e "${GREEN}📚 Next steps:${NC}"
    echo -e "${GREEN}1. Visit your repository on GitHub${NC}"
    echo -e "${GREEN}2. Add a description and topics (ocr, vietnamese, nextjs, typescript)${NC}"
    echo -e "${GREEN}3. Consider deploying to Vercel for live demo${NC}"
    echo -e "${GREEN}4. Share with the Vietnamese developer community!${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Failed to push to GitHub${NC}"
    echo -e "${YELLOW}💡 Possible solutions:${NC}"
    echo -e "${YELLOW}1. Check if the repository URL is correct${NC}"
    echo -e "${YELLOW}2. Make sure you have push access to the repository${NC}"
    echo -e "${YELLOW}3. Verify your GitHub authentication (SSH key or token)${NC}"
    echo -e "${YELLOW}4. Try: git push --set-upstream origin main --force${NC}"
    exit 1
fi
