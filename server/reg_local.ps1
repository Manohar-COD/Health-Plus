$url = 'http://localhost:5000/api/auth/register'
$payload = @{ name = 'manu'; email = 'Manu@gmail.com'; password = '123456' }
try {
  $res = Invoke-RestMethod -Uri $url -Method Post -Body ($payload | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
  $res | ConvertTo-Json -Depth 10
} catch {
  if ($_.Exception.Response) {
    try {
      $resp = $_.Exception.Response
      $stream = $resp.GetResponseStream()
      $reader = New-Object System.IO.StreamReader($stream)
      $text = $reader.ReadToEnd()
      Write-Output $text
    } catch {
      $_.Exception.Message
    }
  } else {
    $_.Exception.Message
  }
}
