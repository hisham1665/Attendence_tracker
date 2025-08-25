#!/bin/bash

# HH Attendance Tracker - Production Readiness Check
echo "🚀 HH Attendance Tracker - Production Readiness Check"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check functions
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${RED}❌ FAIL${NC}"
    fi
}

echo -e "\n${BLUE}📋 Checking Project Structure...${NC}"

# Check if required files exist
echo -n "Frontend build directory exists: "
[ -d "frontend/dist" ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${YELLOW}⚠️  Run 'npm run build' in frontend${NC}"

echo -n "Backend package.json exists: "
[ -f "backend/package.json" ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}"

echo -n "Environment configuration exists: "
[ -f "backend/.env.example" ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}"

echo -n "Production environment config exists: "
[ -f "backend/.env.production" ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}"

echo -n "Docker configuration exists: "
[ -f "Dockerfile" ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}"

echo -n "Docker Compose configuration exists: "
[ -f "docker-compose.yml" ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}"

echo -n "Deployment documentation exists: "
[ -f "DEPLOYMENT.md" ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}"

echo -n "Progressive Web App manifest exists: "
[ -f "frontend/public/manifest.json" ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}"

echo -e "\n${BLUE}🔧 Checking Dependencies...${NC}"

# Check Node.js version
echo -n "Node.js version (>=16): "
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 16 ]; then
    echo -e "${GREEN}✅ PASS (v$(node -v | cut -d'v' -f2))${NC}"
else
    echo -e "${RED}❌ FAIL (v$(node -v | cut -d'v' -f2)) - Upgrade to Node.js 16+${NC}"
fi

# Check npm version
echo -n "npm version (>=8): "
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -ge 8 ]; then
    echo -e "${GREEN}✅ PASS (v$(npm -v))${NC}"
else
    echo -e "${RED}❌ FAIL (v$(npm -v)) - Upgrade to npm 8+${NC}"
fi

echo -e "\n${BLUE}🛡️  Checking Security Configuration...${NC}"

# Check if security dependencies are installed
echo -n "Backend security dependencies: "
if grep -q "helmet\|express-rate-limit\|compression" backend/package.json; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL - Install security middleware${NC}"
fi

echo -n "Environment variables template: "
if grep -q "JWT_SECRET\|MONGODB_URI\|NODE_ENV" backend/.env.example; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL - Complete environment configuration${NC}"
fi

echo -e "\n${BLUE}⚡ Checking Performance Optimizations...${NC}"

echo -n "Frontend build optimization: "
if grep -q "terser\|rollup" frontend/vite.config.js 2>/dev/null; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${YELLOW}⚠️  Configure build optimizations${NC}"
fi

echo -n "SEO meta tags: "
if grep -q "og:title\|twitter:card" frontend/index.html 2>/dev/null; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${YELLOW}⚠️  Add SEO meta tags${NC}"
fi

echo -e "\n${BLUE}📱 Checking PWA Configuration...${NC}"

echo -n "PWA manifest: "
if grep -q "manifest.json" frontend/index.html 2>/dev/null; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${YELLOW}⚠️  Link PWA manifest${NC}"
fi

echo -n "Service worker ready: "
if [ -f "frontend/public/sw.js" ] || grep -q "serviceWorker" frontend/src/main.jsx 2>/dev/null; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${YELLOW}⚠️  Optional: Add service worker for offline support${NC}"
fi

echo -e "\n${BLUE}🚀 Deployment Readiness Summary${NC}"
echo "================================================="

READY_COUNT=0
TOTAL_CHECKS=15

# Summary checks
[ -d "frontend/dist" ] && ((READY_COUNT++))
[ -f "backend/package.json" ] && ((READY_COUNT++))
[ -f "backend/.env.example" ] && ((READY_COUNT++))
[ -f "backend/.env.production" ] && ((READY_COUNT++))
[ -f "Dockerfile" ] && ((READY_COUNT++))
[ -f "docker-compose.yml" ] && ((READY_COUNT++))
[ -f "DEPLOYMENT.md" ] && ((READY_COUNT++))
[ -f "frontend/public/manifest.json" ] && ((READY_COUNT++))
[ "$NODE_VERSION" -ge 16 ] && ((READY_COUNT++))
[ "$NPM_VERSION" -ge 8 ] && ((READY_COUNT++))
grep -q "helmet\|express-rate-limit\|compression" backend/package.json && ((READY_COUNT++))
grep -q "JWT_SECRET\|MONGODB_URI\|NODE_ENV" backend/.env.example && ((READY_COUNT++))
grep -q "terser\|rollup" frontend/vite.config.js 2>/dev/null && ((READY_COUNT++))
grep -q "og:title\|twitter:card" frontend/index.html 2>/dev/null && ((READY_COUNT++))
grep -q "manifest.json" frontend/index.html 2>/dev/null && ((READY_COUNT++))

PERCENTAGE=$((READY_COUNT * 100 / TOTAL_CHECKS))

if [ $PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}🎉 Production Ready! ($READY_COUNT/$TOTAL_CHECKS checks passed - $PERCENTAGE%)${NC}"
    echo -e "${GREEN}✅ Your application is ready for deployment!${NC}"
elif [ $PERCENTAGE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  Almost Ready ($READY_COUNT/$TOTAL_CHECKS checks passed - $PERCENTAGE%)${NC}"
    echo -e "${YELLOW}📝 Complete the remaining items for optimal deployment${NC}"
else
    echo -e "${RED}❌ Needs Work ($READY_COUNT/$TOTAL_CHECKS checks passed - $PERCENTAGE%)${NC}"
    echo -e "${RED}🔧 Address the failed checks before deployment${NC}"
fi

echo -e "\n${BLUE}📚 Next Steps:${NC}"
if [ ! -d "frontend/dist" ]; then
    echo "1. Build frontend: cd frontend && npm run build"
fi
echo "2. Configure environment variables in backend/.env.production"
echo "3. Test locally: npm start (in backend directory)"
echo "4. Deploy using your preferred method (see DEPLOYMENT.md)"
echo "5. Set up monitoring and backup procedures"

echo -e "\n${BLUE}📖 For detailed deployment instructions, see DEPLOYMENT.md${NC}"
