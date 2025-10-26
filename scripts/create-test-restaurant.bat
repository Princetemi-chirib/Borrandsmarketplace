@echo off
echo 🚀 Creating test restaurant user...
echo.

echo 1. Registering user...
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Restaurant Owner\",\"phone\":\"+2348123456789\",\"password\":\"testpass123\",\"role\":\"restaurant\",\"university\":\"University of Lagos\"}"

echo.
echo.
echo 2. Attempting login...
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"+2348123456789\",\"password\":\"testpass123\"}"

echo.
echo.
echo 🎉 TEST RESTAURANT USER CREATED!
echo.
echo 📋 LOGIN CREDENTIALS:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Phone: +2348123456789
echo Password: testpass123
echo Role: restaurant
echo University: University of Lagos
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📱 How to Login:
echo 1. Go to: http://localhost:3000/auth/login
echo 2. Enter the phone number and password above
echo 3. Or use OTP login with just the phone number
echo.
echo 🏪 Next Steps:
echo 1. Login with the credentials above
echo 2. Complete restaurant profile setup if needed
echo 3. Navigate to restaurant dashboard
echo.
pause




