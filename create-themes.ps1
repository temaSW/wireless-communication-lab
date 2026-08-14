$ErrorActionPreference = "Stop"

& (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "setup-theme-showcase.ps1")
