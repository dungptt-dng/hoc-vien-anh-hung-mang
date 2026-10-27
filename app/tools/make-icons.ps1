# Tạo biểu tượng PNG cho app (giống icons/icon.svg). Chạy: powershell -File tools\make-icons.ps1
Add-Type -AssemblyName System.Drawing
$out = Join-Path $PSScriptRoot '..\icons'

function Make-Icon([int]$size, [string]$file, [bool]$maskable) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $s = $size / 512.0
  $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
  $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(157, 78, 221)), ([System.Drawing.Color]::FromArgb(247, 37, 133)), 45
  if ($maskable) { $g.FillRectangle($bg, $rect) }
  else {
    $r = 112 * $s; $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, 2 * $r, 2 * $r, 180, 90); $path.AddArc($size - 2 * $r, 0, 2 * $r, 2 * $r, 270, 90)
    $path.AddArc($size - 2 * $r, $size - 2 * $r, 2 * $r, 2 * $r, 0, 90); $path.AddArc(0, $size - 2 * $r, 2 * $r, 2 * $r, 90, 90)
    $path.CloseFigure(); $g.FillPath($bg, $path)
  }
  # Thu nhỏ hình khiên cho bản maskable (vùng an toàn 80%)
  $k = if ($maskable) { 0.78 } else { 1.0 }
  $off = (1 - $k) * 256 * $s
  function P([double]$x, [double]$y) { New-Object System.Drawing.PointF ([float]($off + $x * $s * $k)), ([float]($off + $y * $s * $k)) }
  $shield = New-Object System.Drawing.Drawing2D.GraphicsPath
  $shield.AddLine((P 256 70), (P 410 130)); $shield.AddLine((P 410 130), (P 410 250))
  $shield.AddBezier((P 410 250), (P 410 350), (P 340 420), (P 256 452))
  $shield.AddBezier((P 256 452), (P 172 420), (P 102 350), (P 102 250))
  $shield.AddLine((P 102 250), (P 102 130)); $shield.CloseFigure()
  $srect = New-Object System.Drawing.RectangleF 0, (70 * $s), $size, (390 * $s)
  $gold = New-Object System.Drawing.Drawing2D.LinearGradientBrush $srect, ([System.Drawing.Color]::FromArgb(255, 224, 102)), ([System.Drawing.Color]::FromArgb(255, 183, 3)), 90
  $g.FillPath($gold, $shield)
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), ([float](18 * $s * $k)); $pen.LineJoin = 'Round'
  $g.DrawPath($pen, $shield)
  $star = @((P 256 170), (P 282 228), (P 345 234), (P 298 276), (P 312 338), (P 256 306), (P 200 338), (P 214 276), (P 167 234), (P 230 228))
  $g.FillPolygon((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(123, 44, 191))), [System.Drawing.PointF[]]$star)
  $bmp.Save((Join-Path $out $file), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

Make-Icon 192 'icon-192.png' $false
Make-Icon 512 'icon-512.png' $false
Make-Icon 512 'icon-maskable-512.png' $true
Write-Output 'Đã tạo biểu tượng.'
