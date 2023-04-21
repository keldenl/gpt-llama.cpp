# Prompt the user to drag and drop the location of the Llama-based model (.bin) and read it from standard input
Write-Host "--GPT-LLAMA.CPP TEST INSTALLATION SCRIPT LAUNCHED--"
Write-Host "PLEASE MAKE SURE THAT A LOCAL GPT-LLAMA.CPP SERVER IS STARTED. OPEN A SEPARATE TERMINAL WINDOW START IT.`n"
$path = Read-Host "Please drag and drop the location of your Llama-based Model (.bin) here and press enter"

# Check if the file exists
if (-not (Test-Path $path)) {
    Write-Host "Error: The file does not exist. Please make sure you have provided the correct path."
    exit 1
}

# Check if the file has a .bin extension
if (-not ($path.EndsWith(".bin"))) {
    Write-Host "Error: The file extension is not .bin. Please make sure you have provided the correct file."
    exit 1
}

# Validate that the file is a child of the /llama.cpp/models/ directory
if ($path -notlike "*\llama.cpp\models\*") {
    Write-Host "Error: The file must be a child of the /llama.cpp/models/ directory. Please move your model file and try again."
    exit 1
}

# Wait for the curl command to finish and capture the response
$response = Invoke-RestMethod -Method POST -Uri 'http://localhost:443/v1/chat/completions' `
-Headers @{"Authorization"="Bearer $path"; "Content-Type"="application/json"} `
-Body '{
   "model": "gpt-3.5-turbo",
   "messages": [
      {
         "role": "system",
         "content": "You are ChatGPT, a helpful assistant developed by OpenAI."
      },
      {
         "role": "user",
         "content": "How are you doing today?"
      }
   ]
}'

# Print the response and a success message if the curl command succeeded
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "--RESPONSE--"
    Write-Host "$response"
    Write-Host ""
    Write-Host "--RESULTS--"
    Write-Host "Curl command was successful!"
    Write-Host "To use any app with gpt-llama.cpp, please provide the following as the OPENAI_API_KEY:"
    Write-Host "$path"
} else {
    Write-Host ""
    Write-Host "Error: Curl command failed!"
    Write-Host "Is the gpt-llama.cpp server running? Try starting the server and running this script again."
    Write-Host "Please check for any errors in the terminal window running the gpt-llama.cpp server."
}