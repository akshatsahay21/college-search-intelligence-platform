@echo off
echo Creating junction...
mklink /J C:\temp-college "%~dp0"
cd /d C:\temp-college
echo Running db push...
call npm run db:push
echo Cleaning up...
cd /d "%~dp0"
rmdir C:\temp-college
echo Done!
