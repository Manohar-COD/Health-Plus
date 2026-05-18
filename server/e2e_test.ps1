$base='https://health-plus-production.up.railway.app'
$ts=Get-Date -Format yyyyMMddHHmmss
$email="e2e$ts@example.com"
$payload=@{name='E2E Test'; email=$email; password='Test1234'}
try {
  $reg = Invoke-RestMethod -Uri "$base/api/auth/register" -Method Post -Body ($payload | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
  Write-Output '---REGISTER---'
  $reg | ConvertTo-Json -Depth 10

  $login = @{ email = $email; password = 'Test1234' }
  $ln = Invoke-RestMethod -Uri "$base/api/auth/login" -Method Post -Body ($login | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
  Write-Output '---LOGIN---'
  $ln | ConvertTo-Json -Depth 10

  $token = $ln.token
  $hdr = @{ Authorization = "Bearer $token" }
  Write-Output '---ME---'
  (Invoke-RestMethod -Uri "$base/api/auth/me" -Method Get -Headers $hdr -ErrorAction Stop) | ConvertTo-Json -Depth 10

  Write-Output '---TODAY---'
  (Invoke-RestMethod -Uri "$base/api/health/today" -Method Get -Headers $hdr -ErrorAction Stop) | ConvertTo-Json -Depth 10
} catch {
  Write-Output '---ERROR---'
  if ($_.Exception.Response -and $_.Exception.Response.Content) {
    try {
      $_.Exception.Response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    } catch {
      $_.Exception.Response.Content
    }
  } else {
    $_.Exception.Message
  }
}
