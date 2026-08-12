$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class LogoProcessor {
    public static void Process(string srcPath, string outLogoFull, string outIcon, string outApple, string outIco) {
        using (Bitmap srcBmp = new Bitmap(srcPath)) {
            int w = srcBmp.Width;
            int h = srcBmp.Height;

            Bitmap bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(bmp)) {
                g.DrawImage(srcBmp, 0, 0, w, h);
            }

            BitmapData data = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            int bytes = Math.Abs(data.Stride) * h;
            byte[] rgbValues = new byte[bytes];
            System.Runtime.InteropServices.Marshal.Copy(data.Scan0, rgbValues, 0, bytes);

            bool[,] visited = new bool[w, h];
            Queue<Point> queue = new Queue<Point>();

            for (int x = 0; x < w; x++) {
                for (int y = 0; y < h; y++) {
                    if (x == 0 || x == w - 1 || y == 0 || y == h - 1) {
                        int idx = (y * w + x) * 4;
                        byte b = rgbValues[idx];
                        byte gVal = rgbValues[idx + 1];
                        byte r = rgbValues[idx + 2];
                        int avg = (r + gVal + b) / 3;
                        int sat = Math.Max(Math.Max(Math.Abs(r - gVal), Math.Abs(gVal - b)), Math.Abs(r - b));
                        if (avg > 220 && sat < 30) {
                            queue.Enqueue(new Point(x, y));
                            visited[x, y] = true;
                        }
                    }
                }
            }

            while (queue.Count > 0) {
                Point p = queue.Dequeue();
                int px = p.X;
                int py = p.Y;

                int idx = (py * w + px) * 4;
                rgbValues[idx + 3] = 0;

                int[] dx = { -1, 1, 0, 0, -1, -1, 1, 1 };
                int[] dy = { 0, 0, -1, 1, -1, 1, -1, 1 };

                for (int i = 0; i < 8; i++) {
                    int nx = px + dx[i];
                    int ny = py + dy[i];

                    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                        if (!visited[nx, ny]) {
                            int nIdx = (ny * w + nx) * 4;
                            byte b = rgbValues[nIdx];
                            byte gVal = rgbValues[nIdx + 1];
                            byte r = rgbValues[nIdx + 2];
                            int avg = (r + gVal + b) / 3;
                            int sat = Math.Max(Math.Max(Math.Abs(r - gVal), Math.Abs(gVal - b)), Math.Abs(r - b));

                            if (avg > 200 && sat < 35) {
                                visited[nx, ny] = true;
                                queue.Enqueue(new Point(nx, ny));
                            }
                        }
                    }
                }
            }

            System.Runtime.InteropServices.Marshal.Copy(rgbValues, 0, data.Scan0, bytes);
            bmp.UnlockBits(data);

            bmp.Save(outLogoFull, ImageFormat.Png);

            int minX = w, maxX = 0, minY = h, maxY = 0;
            for (int x = 0; x < w; x++) {
                for (int y = 0; y < (int)(h * 0.72); y++) {
                    Color c = bmp.GetPixel(x, y);
                    if (c.A > 0) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            int bw = maxX - minX + 1;
            int bh = maxY - minY + 1;
            int size = Math.Max(bw, bh) + 16;

            using (Bitmap square = new Bitmap(size, size, PixelFormat.Format32bppArgb)) {
                using (Graphics g2 = Graphics.FromImage(square)) {
                    g2.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                    g2.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;

                    int offsetX = (size - bw) / 2;
                    int offsetY = (size - bh) / 2;

                    g2.DrawImage(bmp, new Rectangle(offsetX, offsetY, bw, bh), new Rectangle(minX, minY, bw, bh), GraphicsUnit.Pixel);
                }

                square.Save(outIcon, ImageFormat.Png);
                square.Save(outApple, ImageFormat.Png);
                square.Save(outIco, ImageFormat.Icon);
            }

            bmp.Dispose();
        }
    }
}
"@

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies System.Drawing

$src = "C:\Users\X\.gemini\antigravity-ide\brain\f2884d68-77cc-4ec5-ae06-ddd68ed4cd4e\media__1786503158500.png"
$fullLogo = Join-Path (Get-Location) "public/logo-full.png"
$icon = Join-Path (Get-Location) "src/app/icon.png"
$apple = Join-Path (Get-Location) "src/app/apple-icon.png"
$ico = Join-Path (Get-Location) "public/favicon.ico"
$logo = Join-Path (Get-Location) "public/logo.png"

[LogoProcessor]::Process($src, $fullLogo, $icon, $apple, $ico)
Copy-Item -Path $icon -Destination $logo -Force

Write-Output "FAST C# Logo Processed Successfully!"
