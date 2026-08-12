Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\X\.gemini\antigravity-ide\brain\f2884d68-77cc-4ec5-ae06-ddd68ed4cd4e\media__1786503158500.png"

if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found at $srcPath"
    exit 1
}

$img = [System.Drawing.Image]::FromFile($srcPath)
$w = $img.Width
$h = $img.Height

$bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, $w, $h)
$g.Dispose()
$img.Dispose()

# 1. Flood fill outer background starting from border edges
$visited = New-Object 'bool[,]' $w, $h
$queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

for ($x = 0; $x -lt $w; $x++) {
    for ($y = 0; $y -lt $h; $y++) {
        if ($x -eq 0 -or $x -eq ($w - 1) -or $y -eq 0 -or $y -eq ($h - 1)) {
            $c = $bmp.GetPixel($x, $y)
            $avg = ($c.R + $c.G + $c.B) / 3
            $sat = [Math]::Max([Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Abs($c.G - $c.B)), [Math]::Abs($c.R - $c.B))
            if ($avg -gt 220 -and $sat -lt 30) {
                $queue.Enqueue((New-Object System.Drawing.Point($x, $y)))
                $visited[$x, $y] = $true
            }
        }
    }
}

$dx = @(-1, 1, 0, 0, -1, -1, 1, 1)
$dy = @(0, 0, -1, 1, -1, 1, -1, 1)

while ($queue.Count -gt 0) {
    $p = $queue.Dequeue()
    $px = $p.X
    $py = $p.Y

    for ($i = 0; $i -lt 8; $i++) {
        $nx = $px + $dx[$i]
        $ny = $py + $dy[$i]

        if ($nx -ge 0 -and $nx -lt $w -and $ny -ge 0 -and $ny -lt $h) {
            if (-not $visited[$nx, $ny]) {
                $c = $bmp.GetPixel($nx, $ny)
                $avg = ($c.R + $c.G + $c.B) / 3
                $sat = [Math]::Max([Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Abs($c.G - $c.B)), [Math]::Abs($c.R - $c.B))
                
                if ($avg -gt 210 -and $sat -lt 35) {
                    $visited[$nx, $ny] = $true
                    $queue.Enqueue((New-Object System.Drawing.Point($nx, $ny)))
                }
            }
        }
    }
}

# Set flood filled pixels to transparent
for ($x = 0; $x -lt $w; $x++) {
    for ($y = 0; $y -lt $h; $y++) {
        if ($visited[$x, $y]) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

# Save full transparent logo
$bmp.Save((Join-Path (Get-Location) "public/logo-full.png"), [System.Drawing.Imaging.ImageFormat]::Png)

# 2. Extract emblem only (top 75% region) for crisp icon / favicon
$minX = $w; $maxX = 0; $minY = $h; $maxY = 0
for ($x = 0; $x -lt $w; $x++) {
    for ($y = 0; $y -lt [int]($h * 0.70); $y++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -gt 0) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$bw = $maxX - $minX + 1
$bh = $maxY - $minY + 1

$size = [Math]::Max($bw, $bh) + 16
$square = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g2 = [System.Drawing.Graphics]::FromImage($square)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$offsetX = [int](($size - $bw) / 2)
$offsetY = [int](($size - $bh) / 2)

$srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $bw, $bh)
$destRect = New-Object System.Drawing.Rectangle($offsetX, $offsetY, $bw, $bh)
$g2.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$g2.Dispose()

# Save icon files
$square.Save((Join-Path (Get-Location) "public/logo.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$square.Save((Join-Path (Get-Location) "src/app/icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$square.Save((Join-Path (Get-Location) "src/app/apple-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$square.Save((Join-Path (Get-Location) "public/favicon.ico"), [System.Drawing.Imaging.ImageFormat]::Icon)

$bmp.Dispose()
$square.Dispose()

Write-Output "Successfully processed new high-res logo with transparent background and generated all favicon icons!"
