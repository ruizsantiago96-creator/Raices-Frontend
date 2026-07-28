@echo off
REM ============================================================
REM  Raices Frontend - Comandos ejecutados para consumir APIs
REM  Fecha: 27 de Julio, 2026
REM ============================================================

echo ============================================
echo  PASO 1: Verificar estado del repositorio
echo ============================================
git status
git branch -a
git log --oneline -5

echo.
echo ============================================
echo  PASO 2: Subir cambios de dev a main
echo ============================================
git checkout main
git pull origin main
git merge dev --no-edit
git push origin main

echo.
echo ============================================
echo  PASO 3: Subir cambios a origin/dev
echo ============================================
git checkout dev
git push origin dev

echo.
echo ============================================
echo  PASO 4: Verificar build
echo ============================================
npx vite build

echo.
echo ============================================
echo  COMPLETADO
echo ============================================
pause
