#!/bin/bash
# Taskflow Deployment Verification Script

echo "🔍 Checking Taskflow Deployment Configuration..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_var() {
    var_name=$1
    var_value=$2
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ $var_name is not set${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $var_name is set${NC}"
        echo "   Value: $var_value"
        return 0
    fi
}

echo "📌 RAILWAY BACKEND CHECKS:"
echo "================================"
check_var "FRONTEND_URL" "$FRONTEND_URL"
check_var "GOOGLE_REDIRECT_URI" "$GOOGLE_REDIRECT_URI"
check_var "GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_ID"
check_var "GOOGLE_CLIENT_SECRET" "$GOOGLE_CLIENT_SECRET"
check_var "SUPABASE_URL" "$SUPABASE_URL"
check_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
check_var "SECRET_KEY" "$SECRET_KEY"

echo ""
echo "📌 VERCEL FRONTEND CHECKS:"
echo "================================"
check_var "NEXT_PUBLIC_API_URL" "$NEXT_PUBLIC_API_URL"

echo ""
echo "🔗 CONFIGURATION VALIDATION:"
echo "================================"

# Check if URLs have correct format
if [[ $GOOGLE_REDIRECT_URI == *"localhost"* ]]; then
    echo -e "${RED}❌ GOOGLE_REDIRECT_URI contains localhost${NC}"
    echo "   This will NOT work in production!"
    echo "   Use: https://your-railway-backend-url/auth/google/callback"
else
    echo -e "${GREEN}✓ GOOGLE_REDIRECT_URI doesn't contain localhost${NC}"
fi

if [[ $FRONTEND_URL == *"localhost"* ]] && [[ $FRONTEND_URL != *"vercel"* ]]; then
    echo -e "${RED}❌ FRONTEND_URL contains localhost${NC}"
    echo "   Use your Vercel URL for production!"
else
    echo -e "${GREEN}✓ FRONTEND_URL appears to be production${NC}"
fi

if [[ $NEXT_PUBLIC_API_URL == *"localhost"* ]]; then
    echo -e "${RED}❌ NEXT_PUBLIC_API_URL contains localhost${NC}"
    echo "   Frontend won't be able to reach the backend!"
    echo "   Use: https://your-railway-backend-url"
else
    echo -e "${GREEN}✓ NEXT_PUBLIC_API_URL appears to be production${NC}"
fi

echo ""
echo "📝 NEXT STEPS:"
echo "================================"
echo "1. If any checks failed, update the corresponding environment variables"
echo "2. For Railway: Update in Railway dashboard → Backend → Variables"
echo "3. For Vercel: Update in Vercel dashboard → Settings → Environment Variables"
echo "4. After updating, redeploy both services"
echo ""
echo "5. Test the flow:"
echo "   - Go to your Vercel frontend URL"
echo "   - Click 'Continue with Google'"
echo "   - Check the browser console for any errors"
echo "   - Open DevTools Network tab to see API calls"
