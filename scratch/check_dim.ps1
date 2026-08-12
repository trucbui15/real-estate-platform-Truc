Add-Type -AssemblyName System.Drawing

$inputPath = "public/logo.png"
$img = [System.Drawing.Image]::FromFile((Resolve-Path $inputPath))
Write-Output "Width: $($img.Width), Height: $($img.Height)"
$img.Dispose()
