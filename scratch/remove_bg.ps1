Add-Type -AssemblyName System.Drawing

$inputPath = "public/logo.png"
$outputPath = "public/logo_transparent.png"

$img = [System.Drawing.Image]::FromFile((Resolve-Path $inputPath))
$bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, $img.Width, $img.Height)
$g.Dispose()
$img.Dispose()

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $c = $bmp.GetPixel($x, $y)
        # Check if white/near-white background
        if ($c.R -gt 225 -and $c.G -gt 225 -and $c.B -gt 225) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $c.R, $c.G, $c.B))
        } elseif ($c.R -gt 200 -and $c.G -gt 200 -and $c.B -gt 200) {
            # Smooth edge alpha fading
            $avg = ($c.R + $c.G + $c.B) / 3
            $alpha = [int](255 * (255 - $avg) / 55)
            if ($alpha -lt 0) { $alpha = 0 }
            if ($alpha -gt 255) { $alpha = 255 }
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
        }
    }
}

$bmp.Save((Join-Path (Get-Location) "public/logo.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save((Join-Path (Get-Location) "src/app/icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save((Join-Path (Get-Location) "public/favicon.ico"), [System.Drawing.Imaging.ImageFormat]::Icon)
$bmp.Dispose()

Write-Output "Successfully processed transparent logo and created favicon/icon files!"
