# Drives the cron worker's /run endpoint directly from the terminal until
# ~1,000 books have been imported. Runs several calls IN PARALLEL — each
# Worker invocation gets its own independent 50-subrequest budget (that
# budget is why a single call is capped at ~10 books), so running N calls
# concurrently multiplies real throughput almost linearly instead of
# waiting on ~100 calls one after another. Default of 5 parallel streams
# turns the ~25-30 minute serial run into roughly 5-6 minutes.
#
# Known tradeoff: parallel calls share the same subject-rotation cursor in
# the database, so a few concurrent calls can occasionally land on the same
# page and do slightly redundant work — harmless (ON CONFLICT DO NOTHING
# dedupes everything), just a little less than a perfect N-times speedup.
#
# Usage:
#   .\run-1000.ps1 -Secret "your-secret-here"
#   .\run-1000.ps1 -Secret "your-secret-here" -Parallel 8   # faster, more concurrent load
#   .\run-1000.ps1 -Secret "your-secret-here" -Parallel 1   # old serial behavior

param(
  [string]$Secret = $env:IMPORT_SECRET,
  [int]$TargetBooks = 1000,
  [int]$MaxCallsPerWorker = 40,
  [int]$Parallel = 5
)

if (-not $Secret) {
  Write-Host "Pass the shared secret: .\run-1000.ps1 -Secret '...'" -ForegroundColor Red
  exit 1
}

$WorkerUrl = "https://bookqubit-import-cron.webpagewale.workers.dev/run?maxChunks=1"

$workerScript = {
  param($Url, $Secret, $MaxCalls, $WorkerId)
  $headers = @{ "x-import-secret" = $Secret }
  $emptyStreak = 0
  $call = 0
  $results = @()
  while ($call -lt $MaxCalls -and $emptyStreak -lt 15) {
    $call++
    try {
      $response = Invoke-RestMethod -Uri $Url -Method Post -Headers $headers -TimeoutSec 60
    } catch {
      Start-Sleep -Seconds 2
      continue
    }
    if ($response.capped) { $results += @{ capped = $true }; break }
    $somethingHappened = ($response.imported -gt 0) -or ($response.authorsImported -gt 0) -or ($response.publishersImported -gt 0)
    if ($somethingHappened) { $emptyStreak = 0 } else { $emptyStreak++ }
    $results += @{
      worker = $WorkerId; call = $call; imported = $response.imported
      authors = $response.authorsImported; publishers = $response.publishersImported
      source = $response.source; titles = $response.insertedTitles
    }
  }
  return $results
}

Write-Host "Starting import — target: ~$TargetBooks books using $Parallel parallel streams (up to $MaxCallsPerWorker calls each)" -ForegroundColor Cyan
Write-Host ""

$jobs = 1..$Parallel | ForEach-Object {
  Start-Job -ScriptBlock $workerScript -ArgumentList $WorkerUrl, $Secret, $MaxCallsPerWorker, $_
}

$totalImported = 0
$totalAuthors = 0
$totalPublishers = 0
$seenCapped = $false

while (($jobs | Where-Object { $_.State -eq 'Running' }) -and $totalImported -lt $TargetBooks) {
  Start-Sleep -Seconds 3
  foreach ($job in $jobs) {
    $newResults = Receive-Job -Job $job -Keep:$false -ErrorAction SilentlyContinue
    foreach ($r in $newResults) {
      if ($r.capped) { $seenCapped = $true; continue }
      $totalImported += $r.imported
      $totalAuthors += $r.authors
      $totalPublishers += $r.publishers
      $titles = if ($r.titles) { ($r.titles -join ", ") } else { "" }
      Write-Host ("[worker {0}, call {1}] +{2} books, +{3} authors, +{4} publishers ({5}) — total: {6}/{7}" -f `
        $r.worker, $r.call, $r.imported, $r.authors, $r.publishers, $r.source, $totalImported, $TargetBooks) -ForegroundColor Green
      if ($titles) { Write-Host "     $titles" -ForegroundColor DarkGray }
    }
  }
  if ($seenCapped) {
    Write-Host "Daily write cap reached — stopping all streams." -ForegroundColor Yellow
    $jobs | Stop-Job
    break
  }
}

$jobs | Wait-Job -Timeout 5 | Out-Null
$jobs | Remove-Job -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Done. Imported $totalImported books, $totalAuthors author pages, $totalPublishers publisher pages." -ForegroundColor Cyan
