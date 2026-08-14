$Root = "A:\Work\wireless-lab-site"

$Preview = "$Root\themes-preview"

Write-Host "Creating showcase folders..."

$themes = @(
    "academicpages",
    "hugo-academic",
    "minimal-mistakes",
    "bootstrap-academic"
)

New-Item -ItemType Directory -Force $Preview | Out-Null


foreach ($theme in $themes) {

    $path = "$Preview\$theme"

    New-Item -ItemType Directory -Force $path | Out-Null

    Copy-Item `
        "$Root\labicon.png" `
        "$path\labicon.png" `
        -Force


    @"
<!DOCTYPE html>
<html>
<head>
<title>$theme</title>
<link rel="stylesheet" href="style.css">
</head>

<body>

<header>

<img src="labicon.png">

<h1>
Wireless Communication Laboratory
</h1>

<h2>
$theme preview
</h2>

</header>


<nav>
Research |
People |
Publications |
Projects
</nav>


<section>

<h2>
Research Areas
</h2>

<p>
Wireless communications,
5G/6G networks,
signal processing,
IoT systems.
</p>

</section>


</body>
</html>
"@ | Out-File "$path\index.html"



@"
body {

font-family: Arial, sans-serif;
max-width:1000px;
margin:auto;
padding:40px;

}


img {

width:100px;

}


header {

border-bottom:2px solid #ccc;
padding-bottom:20px;

}


nav {

margin:30px 0;
color:#0056a6;

}

section {

margin-top:40px;

}

"@ | Out-File "$path\style.css"

}



@"
<!DOCTYPE html>

<html>

<head>

<title>
Wireless Communication Laboratory Themes
</title>

</head>


<body>

<h1>
Choose Laboratory Website Theme
</h1>


<ul>

<li>
<a href="themes-preview/academicpages/">
Academic Pages
</a>
</li>


<li>
<a href="themes-preview/hugo-academic/">
Hugo Academic
</a>
</li>


<li>
<a href="themes-preview/minimal-mistakes/">
Minimal Mistakes
</a>
</li>


<li>
<a href="themes-preview/bootstrap-academic/">
Bootstrap Academic
</a>
</li>


</ul>


</body>

</html>

"@ | Out-File "$Root\index.html"


Write-Host ""
Write-Host "Showcase created successfully"