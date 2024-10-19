Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    public class Win32 {
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

        [DllImport("user32.dll", SetLastError=true, CharSet=CharSet.Auto)]
        public static extern int GetWindowTextLength(IntPtr hWnd);

        [DllImport("user32.dll")]
        public static extern bool IsWindowVisible(IntPtr hWnd);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
        
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);

        public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

        [StructLayout(LayoutKind.Sequential)]
        public struct RECT
        {
            public int Left;
            public int Top;
            public int Right;
            public int Bottom;
        }
    }
"@

$windows = @{}

$enumWindowsProc = {
    param([IntPtr]$hWnd, [IntPtr]$lParam)

    $length = [Win32]::GetWindowTextLength($hWnd)
    if ($length -gt 0 -and [Win32]::IsWindowVisible($hWnd)) {
        $sb = New-Object System.Text.StringBuilder($length + 1)
        [Win32]::GetWindowText($hWnd, $sb, $sb.Capacity) | Out-Null
        $windows[$hWnd] = $sb.ToString()
    }
    return $true
}

[Win32]::EnumWindows($enumWindowsProc, [IntPtr]::Zero) | Out-Null

Write-Host "Fenêtres ouvertes :"
$windows.GetEnumerator() | Sort-Object Value | ForEach-Object {
    Write-Host "$($_.Value) (Handle: $($_.Key))"
}

$targetTitle = "PUBG: BATTLEGROUNDS"
$width = 1440
$height = 1440

$targetWindow = $windows.GetEnumerator() | Where-Object { $_.Value.TrimEnd() -eq $targetTitle } | Select-Object -First 1

if ($targetWindow) {
    $hWnd = $targetWindow.Key
    Write-Host "Fenêtre trouvée : $($targetWindow.Value) (Handle: $hWnd)"

    $rect = New-Object Win32+RECT
    [Win32]::GetWindowRect($hWnd, [ref]$rect)
    $x = $rect.Left
    $y = $rect.Top

    $result = [Win32]::MoveWindow($hWnd, $x, $y, $width, $height, $true)
    if ($result) {
        Write-Host "Fenêtre redimensionnée à ${width}x${height}"
    } else {
        Write-Host "Échec du redimensionnement. Code d'erreur : $([System.Runtime.InteropServices.Marshal]::GetLastWin32Error())"
    }
} else {
    Write-Host "Fenêtre non trouvée : $targetTitle"
    Write-Host "Fenêtres similaires trouvées :"
    $windows.GetEnumerator() | Where-Object { $_.Value -like "*$targetTitle*" } | ForEach-Object {
        Write-Host "$($_.Value) (Handle: $($_.Key))"
    }
}