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
        
        if ($x -lt 55 -or ($x -lt 90 -and $y -gt 130)) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            continue
        }

        $isGold = ($c.R -gt 140) -and ($c.G -gt 90) -and ($c.B -lt 160) -and (($c.R - $c.B) -gt 25)
        
        if (-not $isGold) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$minX = $bmp.Width; $maxX = 0; $minY = $bmp.Height; $maxY = 0
for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -gt 0) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$w = $maxX - $minX + 1
$h = $maxY - $minY + 1

$size = [Math]::Max($w, $h) + 16
$square = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g2 = [System.Drawing.Graphics]::FromImage($square)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$offsetX = [int](($size - $w) / 2)
$offsetY = [int](($size - $h) / 2)

$srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $w, $h)
$destRect = New-Object System.Drawing.Rectangle($offsetX, $offsetY, $w, $h)
$g2.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$g2.Dispose()

$square.Save((Join-Path (Get-Location) "public/logo.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$square.Save((Join-Path (Get-Location) "src/app/icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$square.Save((Join-Path (Get-Location) "src/app/apple-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$square.Save((Join-Path (Get-Location) "public/favicon.ico"), [System.Drawing.Imaging.ImageFormat]::Icon)

$bmp.Dispose()
$square.Dispose()
Write-Output "Cleaned and centered transparent gold emblem successfully!"
