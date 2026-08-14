$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$themes = @(
    "academicpages",
    "hugo-academic",
    "minimal-mistakes",
    "bootstrap-academic"
)
$pages = @(
    "index.html",
    "news.html",
    "research.html",
    "projects.html",
    "people.html",
    "publications.html",
    "media.html"
)

foreach ($theme in $themes) {
    $themePath = Join-Path $root "themes-preview\$theme"

    if (-not (Test-Path -LiteralPath (Join-Path $themePath "labicon.png"))) {
        Copy-Item -LiteralPath (Join-Path $root "labicon.png") -Destination (Join-Path $themePath "labicon.png") -Force
    }

    foreach ($page in $pages) {
        $path = Join-Path $themePath $page
        if (-not (Test-Path -LiteralPath $path)) {
            throw "Missing required page: $path"
        }
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $root "js\lab-content.js"))) {
    throw "Missing shared content source: js\lab-content.js"
}

Write-Host "Theme showcase structure is ready."
