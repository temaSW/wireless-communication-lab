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
    "projects.html",
    "people.html",
    "students.html",
    "publications.html",
    "media.html"
)
$contentFiles = @(
    "content\site.md",
    "content\navigation\ru.md",
    "content\navigation\en.md",
    "content\home\ru.md",
    "content\home\en.md",
    "content\people\ru.md",
    "content\people\en.md",
    "content\students\ru.md",
    "content\students\en.md",
    "content\projects\ru.md",
    "content\projects\en.md",
    "content\publications\ru.md",
    "content\publications\en.md",
    "content\media\ru.md",
    "content\media\en.md",
    "content\news\ru.md",
    "content\news\en.md",
    "tools\build-content.js"
)

foreach ($file in $contentFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $root $file))) {
        throw "Missing content build file: $file"
    }
}

node (Join-Path $root "tools\build-content.js")

foreach ($theme in $themes) {
    $themePath = Join-Path $root "themes-preview\$theme"

    Copy-Item -LiteralPath (Join-Path $root "labicon.png") -Destination (Join-Path $themePath "labicon.png") -Force

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
