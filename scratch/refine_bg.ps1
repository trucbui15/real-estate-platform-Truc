Add-Type -AssemblyName System.Drawing

$inputPath = "public/logo.png"
$img = [System.Drawing.Image]::FromFile((Resolve-Path $inputPath))
$bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, $img.Width, $img.Height)
$g.Dispose()
$img.Dispose()

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $c = $bmp.GetPixel($x, $y)
        
        $diffRB = $c.R - $c.B
        $diffGB = $c.G - $c.B
        $avg = ($c.R + $c.G + $c.B) / 3

        # Remove background white, gray lines, and outer white glow
        if ($avg -gt 210 -or ($diffRB -lt 35 -and $diffGB -lt 25) -or ($avg -gt 170 -and $diffRB -lt 45)) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$bmp.Save((Join-Path (Get-Location) "public/logo.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save((Join-Path (Get-Location) "src/app/icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save((Join-Path (Get-Location) "src/app/apple-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save((Join-Path (Get-Location) "public/favicon.ico"), [System.Drawing.Imaging.ImageFormat]::Icon)
$bmp.Dispose()

Write-Output "Cleaned transparent background logo successfully!"
