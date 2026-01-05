# Script to update all remaining files that use logo icons
$filesToUpdate = @(
    "src/components/layout/Header.tsx",
    "src/pages/auth/LoginPage.tsx",
    "src/pages/auth/RegistroPage.tsx",
    "src/pages/menu/ConocenosPage.tsx",
    "src/pages/menu/MasInfoPage.tsx"
)

foreach ($file in $filesToUpdate) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        $updated = $false
        
        # Remove old imports
        $content = $content -replace "import LogoPrincipal from '[^']+LogoPrincipal\.PNG';?`r?`n?", ""
        $content = $content -replace "import LogoModoOscuro from '[^']+LogoModoOscuro\.PNG';?`r?`n?", ""
        
        # Add new import if not present
        if ($content -notmatch 'getSystemIconUrl') {
            # Find the last import statement
            if ($content -match "(?ms)(import .+ from '.+';)(\r?\n\r?\n)") {
                $lastImport = $Matches[1]
                $spacing = $Matches[2]
                $content = $content -replace "(?ms)(import .+ from '.+';)(\r?\n\r?\n)", "$1`r`nimport { getSystemIconUrl } from '../../services/systemIconsApi';$2"
                $updated = $true
            }
        }
        
        # Replace logo usages
        $content = $content -replace "isDark \? LogoModoOscuro : LogoPrincipal", "getSystemIconUrl(isDark ? 'logo-oscuro' : 'logo-principal')"
        $content = $content -replace "\{LogoPrincipal\}", "{getSystemIconUrl('logo-principal')}"
        $content = $content -replace "\{LogoModoOscuro\}", "{getSystemIconUrl('logo-oscuro')}"
        
        Set-Content -Path $file -Value $content -NoNewline -Encoding UTF8
        Write-Host "Updated: $file"
    }
}

Write-Host "`nAll logos updated!"
