@echo off
echo Opening Windows Firewall settings...
echo.
echo Please follow these steps to allow the chat app through firewall:
echo.
echo 1. Click "Allow an app or feature through Windows Defender Firewall"
echo 2. Click "Change settings" (if needed)
echo 3. Click "Allow another app..."
echo 4. Browse and select: Node.js JavaScript Runtime
echo 5. Make sure both "Private" and "Public" are checked
echo 6. Click OK
echo.
echo Ports to allow: 3001 (backend) and 5173 (frontend)
echo.
pause
start ms-settings:network-firewall
