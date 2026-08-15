param(
    [Parameter(Mandatory = $true)]
    [string] $Page,

    [Parameter(Mandatory = $true)]
    [string] $Title,

    [string] $Version = "dev"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$templatePath = Join-Path $root "tools\theme-page.template.html"
$template = Get-Content -Raw -LiteralPath $templatePath

$themes = @(
    @{ Directory = "academicpages"; ThemeName = "Academic Pages" },
    @{ Directory = "hugo-academic"; ThemeName = "Hugo Academic / Hugo Blox" },
    @{ Directory = "minimal-mistakes"; ThemeName = "Minimal Mistakes" },
    @{ Directory = "bootstrap-academic"; ThemeName = "Bootstrap Academic" }
)

foreach ($theme in $themes) {
    $themeDir = Join-Path $root "themes-preview\$($theme.Directory)"
    if (-not (Test-Path -LiteralPath $themeDir)) {
        throw "Missing theme directory: $themeDir"
    }

    $html = $template.
        Replace("{{TITLE}}", $Title).
        Replace("{{PAGE}}", $Page).
        Replace("{{THEME_NAME}}", $theme.ThemeName).
        Replace("{{VERSION}}", $Version)

    $target = Join-Path $themeDir "$Page.html"
    Set-Content -LiteralPath $target -Value $html -NoNewline
    Write-Host "Wrote $target"
}
