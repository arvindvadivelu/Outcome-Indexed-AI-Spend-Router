<#
.SYNOPSIS
    Auto Git Push Watcher
    Monitors the project folder for file changes. When a change is detected,
    it waits up to 15 minutes (to batch rapid edits) and then runs auto_push.bat.
    After a push, it goes back to watching - it only pushes again when NEW changes appear.

.BEHAVIOR
    - Watches all files in the project directory (recursively)
    - Excludes: .git folder, .next folder, node_modules, *.log files
    - On first change detected -> starts a 15-minute cooldown timer
    - When timer fires -> runs auto_push.bat
    - Resets and waits for the NEXT change
    - Never pushes if there are no new changes since last push
#>

param(
    [string]$ProjectPath = "c:\Users\DELL\OneDrive\Desktop\Outcome-Indexed AI Spend Router",
    [int]$CooldownMinutes = 2
)

$PushScript = Join-Path $ProjectPath "auto_push.bat"
$LogFile    = Join-Path $ProjectPath "auto_push_watcher.log"
$CooldownMs = $CooldownMinutes * 60 * 1000

function Write-Log {
    param([string]$Message)
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] $Message"
    Write-Host $line
    Add-Content -Path $LogFile -Value $line
}

# ---- Setup FileSystemWatcher ----
$Watcher = New-Object System.IO.FileSystemWatcher
$Watcher.Path                = $ProjectPath
$Watcher.IncludeSubdirectories = $true
$Watcher.NotifyFilter        = [System.IO.NotifyFilters]::LastWrite `
                              -bor [System.IO.NotifyFilters]::FileName `
                              -bor [System.IO.NotifyFilters]::DirectoryName
$Watcher.Filter              = "*.*"
$Watcher.EnableRaisingEvents = $false   # We poll manually below

Write-Log "=== Auto-Push Watcher Started ==="
Write-Log "Project  : $ProjectPath"
Write-Log "Cooldown : $CooldownMinutes minutes after first change"
Write-Log "Push bat : $PushScript"
Write-Log "========================================"

$pendingChange  = $false
$changeDetectedAt = $null

# Excluded path fragments (case-insensitive)
$Excludes = @("\.git\", ".next\", "node_modules\", "auto_push_watcher.log", "auto_push.bat")

function Is-Excluded([string]$path) {
    foreach ($ex in $Excludes) {
        if ($path -like "*$ex*") { return $true }
    }
    return $false
}

# Main loop — poll git status every 30 seconds
while ($true) {

    if (-not $pendingChange) {
        # ---- Check git for any uncommitted changes ----
        $gitOutput = & git -C $ProjectPath status --porcelain 2>&1
        $hasChanges = ($gitOutput | Where-Object { $_.Trim() -ne "" }).Count -gt 0

        if ($hasChanges) {
            $pendingChange      = $true
            $changeDetectedAt   = Get-Date
            Write-Log "CHANGE DETECTED. Will push in $CooldownMinutes minutes unless more changes arrive."
            Write-Log "Changed files:`n$(& git -C $ProjectPath status --short 2>&1 | Out-String)"
        }
    }
    else {
        # ---- We have a pending change - check cooldown ----
        $elapsed = (Get-Date) - $changeDetectedAt
        $remaining = [int]($CooldownMs / 1000 - $elapsed.TotalSeconds)

        if ($elapsed.TotalMilliseconds -ge $CooldownMs) {
            Write-Log "Cooldown elapsed. Running auto_push.bat..."
            $result = & cmd /c "`"$PushScript`"" 2>&1
            Write-Log "Push output:`n$($result | Out-String)"
            
            # Reset state
            $pendingChange    = $false
            $changeDetectedAt = $null
            Write-Log "Push complete. Watching for next change..."
        }
        else {
            Write-Log "Change pending — push in ~$remaining seconds..."
        }
    }

    # Poll every 30 seconds
    Start-Sleep -Seconds 30
}
