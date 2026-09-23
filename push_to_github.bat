@echo off
title Push Community Help Hub to GitHub
echo =====================================================================
echo   Pushing Community Help Hub to GitHub (Team Neon Nexus - PS58)
echo   Target: https://github.com/SHANMUGAMANONMANIYAN-P/BIZ_HACK.git
echo =====================================================================
echo.
echo Executing git push...
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo =====================================================================
    echo   [SUCCESS] Code successfully pushed to GitHub!
    echo   Refresh your browser at: https://github.com/SHANMUGAMANONMANIYAN-P/BIZ_HACK
    echo =====================================================================
) else (
    echo =====================================================================
    echo   [NOTICE] If a browser window opened, complete the GitHub login.
    echo   If using a Personal Access Token (PAT), run:
    echo   git push https://^<TOKEN^>@github.com/SHANMUGAMANONMANIYAN-P/BIZ_HACK.git main
    echo =====================================================================
)
pause
