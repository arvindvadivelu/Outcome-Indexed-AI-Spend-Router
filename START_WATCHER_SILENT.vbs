' Launches the auto-push watcher silently in the background (no window)
Dim shell
Set shell = CreateObject("WScript.Shell")
shell.Run "powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -File """ & CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & "\auto_push_watcher.ps1""", 0, False
Set shell = Nothing
