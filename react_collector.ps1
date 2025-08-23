# To run the application, type: powershell.exe -ExecutionPolicy Bypass -File .\react_collector.ps1

$workspaceDir = Get-Location
$tempFile = "$env:TEMP\code_content.txt"

# Define file patterns to include for different project types
$filePatterns = @(
    "*.java",        # Java files
    "*.js",          # JavaScript files
    "*.jsx",         # JSX files
    "*.ts",          # TypeScript files
    "*.tsx",         # TSX files
    "*.css",         # CSS files
    "*.scss",        # SCSS files
    "*.html",        # HTML files
    "*.json",        # JSON files (including package.json)
    "*.md",           # Markdown files
    "*.html",
    "*.css"
)

# Exclude directories
$excludeDirs = @(
    "*\target\*",    # Maven target directory
    "*\node_modules\*", # Node modules
    "*\.git\*",      # Git directory
    "*\build\*",     # Build directories
    "*\dist\*",      # Distribution directories
    "*\.next\*",     # Next.js build directory
    "*\.cache\*"     # Cache directories
)

# Find all relevant files
$files = Get-ChildItem -Path $workspaceDir -Recurse -Include $filePatterns -File |
    Where-Object {
        $exclude = $false
        foreach ($dir in $excludeDirs) {
            if ($_.FullName -like $dir) {
                $exclude = $true
                break
            }
        }
        -not $exclude
    }

# Check files
$fileCount = $files.Count
if ($fileCount -eq 0) {
    Write-Host "Aucun fichier trouvé (No files found)."
    exit
}
Write-Host "Nombre de fichiers trouvés (Files found): $fileCount"

# Empty the temp file
"" | Out-File -FilePath $tempFile -Encoding UTF8

# Add file contents
foreach ($file in $files) {
    "// FILE: $($file.FullName)" | Add-Content -Path $tempFile -Encoding UTF8
    Get-Content -Path $file.FullName | Add-Content -Path $tempFile -Encoding UTF8
    "`n" | Add-Content -Path $tempFile -Encoding UTF8
}

# Copy to clipboard
Get-Content -Path $tempFile | Set-Clipboard
Write-Host "Contenu des fichiers copié dans le presse-papiers! (File contents copied to clipboard!)"

# Clean up
Remove-Item -Path $tempFile -ErrorAction SilentlyContinue