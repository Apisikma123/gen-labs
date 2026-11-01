# GEN LABS — Local Dev Host PowerShell Launcher
Set-Location -Path $PSScriptRoot
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  GEN LABS - Starting Local Development Host..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

node dev.js
