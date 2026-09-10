Add-Type -AssemblyName System.Drawing
$size = 1024
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Background
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#050505'))
$g.FillRectangle($bgBrush, 0, 0, $size, $size)

# Outer decorative gold border
$goldColor = [System.Drawing.ColorTranslator]::FromHtml('#e8c872')
$borderPen = New-Object System.Drawing.Pen($goldColor, 12)
$margin = 120
$g.DrawRectangle($borderPen, $margin, $margin, ($size - 2 * $margin), ($size - 2 * $margin))

# Gold Stylized Monogram
$goldBrush = New-Object System.Drawing.SolidBrush($goldColor)
$font = New-Object System.Drawing.Font('Georgia', 420, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
$rect = New-Object System.Drawing.RectangleF(0, -10, $size, $size)

$g.DrawString('E', $font, $goldBrush, $rect, $sf)

$iconPath = Join-Path $PSScriptRoot "assets\icon.png"
$splashPath = Join-Path $PSScriptRoot "assets\splash-icon.png"
$adaptivePath = Join-Path $PSScriptRoot "assets\adaptive-icon.png"

$bmp.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($splashPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($adaptivePath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
Write-Host "Generated assets successfully at $iconPath"
