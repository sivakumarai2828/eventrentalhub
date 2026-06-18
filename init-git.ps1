# init-git.ps1 — one-time Git setup for the Rental App.
# Run from this folder in PowerShell:  .\init-git.ps1
# (If you get a script-blocked error, run:
#   powershell -ExecutionPolicy Bypass -File .\init-git.ps1 )

$ErrorActionPreference = "Stop"

# Move to the script's own directory
Set-Location -Path $PSScriptRoot

# Check git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed. Get it from https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

if (Test-Path ".git") {
    Write-Host "This folder is already a git repository." -ForegroundColor Yellow
    git status
    exit 0
}

git init -b main
git config user.email "sivakumarai2828@gmail.com"
git config user.name "Siva"
git add .
git commit -m "Initial commit: React + FastAPI rental app scaffold"

Write-Host ""
Write-Host "Done. Repository initialized with the first commit." -ForegroundColor Green
git log --oneline
