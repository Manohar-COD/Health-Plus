$url = 'https://health-plus-production.up.railway.app/api/auth/register'
$payload = @{ name='manu'; email='Manu@gmail.com'; password='123456' }
try {
  $req = Invoke-WebRequest -Uri $url -Method Post -Body ($payload | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
  Write-Output "Status: $($req.StatusCode.Value__)"
  Write-Output $req.Content
} catch {
  if ($_.Exception.Response) {
    $resp = $_.Exception.Response
    $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $text = $sr.ReadToEnd()
    Write-Output $text
  } else {
    Write-Output $_.Exception.Message
  }
}
