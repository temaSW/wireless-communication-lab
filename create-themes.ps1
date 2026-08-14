$root = Get-Location

# Создание структуры
$themes = @(
    "academic-classic",
    "tech-lab",
    "research-group",
    "minimal-ieee"
)

foreach ($theme in $themes) {
    New-Item -ItemType Directory -Force "themes\$theme" | Out-Null
}

# Общий логотип
Copy-Item "labicon.png" "themes\academic-classic\labicon.png" -Force
Copy-Item "labicon.png" "themes\tech-lab\labicon.png" -Force
Copy-Item "labicon.png" "themes\research-group\labicon.png" -Force
Copy-Item "labicon.png" "themes\minimal-ieee\labicon.png" -Force


# Academic Classic
@"
<!DOCTYPE html>
<html>
<head>
<title>Wireless Communication Laboratory</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header>
<img src="labicon.png">
<h1>Wireless Communication Laboratory</h1>
<p>Institute Research Group</p>
</header>

<nav>
<a href="../../index.html">Themes</a>
</nav>

<main>
<h2>Research Areas</h2>
<p>Wireless networks, communication systems, signal processing.</p>

<h2>Projects</h2>
<p>Laboratory projects and publications.</p>
</main>
</body>
</html>
"@ | Out-File themes\academic-classic\index.html


@"
body {
font-family: Georgia, serif;
margin:40px;
color:#222;
}

header {
border-bottom:2px solid #333;
padding-bottom:20px;
}

img {
width:80px;
float:left;
margin-right:20px;
}

h1 {
font-size:36px;
}
"@ | Out-File themes\academic-classic\style.css



# Tech Lab
@"
<!DOCTYPE html>
<html>
<head>
<title>Wireless Communication Laboratory</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

<header>
<img src="labicon.png">
<h1>WIRELESS LAB</h1>
</header>

<section>
<h2>Research / RF / Networks / AI</h2>
<p>Advanced communication technologies.</p>
</section>

</body>
</html>
"@ | Out-File themes\tech-lab\index.html


@"
body {
background:#111;
color:#eee;
font-family:Arial;
padding:40px;
}

img {
width:90px;
}

h1 {
color:#00d9ff;
font-size:45px;
}

section {
border:1px solid #444;
padding:30px;
}
"@ | Out-File themes\tech-lab\style.css



# Research Group
@"
<!DOCTYPE html>
<html>
<head>
<title>Research Group</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

<div class="card">
<img src="labicon.png">
<h1>Wireless Communication Research Group</h1>

<h2>Publications</h2>
<p>Scientific papers and conferences.</p>

<h2>Projects</h2>
<p>Current laboratory activities.</p>

</div>

</body>
</html>
"@ | Out-File themes\research-group\index.html


@"
body {
font-family:Arial;
background:#f4f4f4;
}

.card {
background:white;
max-width:900px;
margin:50px auto;
padding:40px;
box-shadow:0 0 20px #ccc;
}

img {
width:100px;
}
"@ | Out-File themes\research-group\style.css



# Minimal IEEE
@"
<!DOCTYPE html>
<html>
<head>
<title>Wireless Communication Laboratory</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

<img src="labicon.png">

<h1>Wireless Communication Laboratory</h1>

<hr>

<h2>Research</h2>
<p>Communication theory, networks, antennas, signal processing.</p>

</body>
</html>
"@ | Out-File themes\minimal-ieee\index.html


@"
body {
font-family:Arial;
max-width:900px;
margin:60px auto;
line-height:1.6;
}

img {
width:70px;
}
"@ | Out-File themes\minimal-ieee\style.css



# Главная страница выбора
@"
<!DOCTYPE html>
<html>
<head>
<title>Laboratory Website Themes</title>
</head>

<body>

<h1>Select Laboratory Website Style</h1>

<ul>
<li><a href="themes/academic-classic/">Academic Classic</a></li>
<li><a href="themes/tech-lab/">Tech Lab</a></li>
<li><a href="themes/research-group/">Research Group</a></li>
<li><a href="themes/minimal-ieee/">Minimal IEEE</a></li>
</ul>

</body>
</html>
"@ | Out-File index.html

Write-Host "Themes created."