[CmdletBinding()]
param(
    [string]$ContextPath = (Join-Path $PSScriptRoot '../../../context')
)

$ErrorActionPreference = 'Stop'

$webPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$resolvedContextPath = (Resolve-Path -LiteralPath $ContextPath).Path

function Assert-SameTextFile {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Snapshot
    )

    if (-not (Test-Path -LiteralPath $Source -PathType Leaf)) {
        throw "Contract source does not exist: $Source"
    }
    if (-not (Test-Path -LiteralPath $Snapshot -PathType Leaf)) {
        throw "Web contract snapshot does not exist: $Snapshot"
    }

    $sourceContent = [System.IO.File]::ReadAllText($Source).Replace("`r`n", "`n")
    $snapshotContent = [System.IO.File]::ReadAllText($Snapshot).Replace("`r`n", "`n")
    if ($sourceContent -cne $snapshotContent) {
        throw "Web contract snapshot is out of sync: $Snapshot`nSource: $Source"
    }

    Write-Host "OK  $Snapshot"
}

Assert-SameTextFile `
    -Source (Join-Path $resolvedContextPath 'openapi/core-api.yaml') `
    -Snapshot (Join-Path $webPath 'docs/api/open-api.yaml')
Assert-SameTextFile `
    -Source (Join-Path $resolvedContextPath 'openapi/compute-api.yaml') `
    -Snapshot (Join-Path $webPath 'docs/api/compute-api.yaml')

Write-Host 'Web OpenAPI snapshots are synchronized with Context.'
