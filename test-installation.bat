@echo off

REM Prompt the user to drag and drop the location of the Llama-based model (.bin) and read it from standard input
echo --GPT-LLAMA.CPP TEST INSTALLATION SCRIPT LAUNCHED--
echo PLEASE MAKE SURE THAT A LOCAL GPT-LLAMA.CPP SERVER IS STARTED. OPEN A SEPARATE TERMINAL WINDOW START IT.
set /p modelpath=Please drag and drop the location of your Llama-based Model (.bin) here and press enter:

REM Check if the file exists
if not exist "%modelpath%" (
    echo Error: The file does not exist. Please make sure you have provided the correct path.
    pause
    exit /b 1
)

REM Check if the file has a .bin extension
set "ext=%modelpath:~-4%"
if not "%ext%" == ".bin" (
    echo Error: The file extension is not .bin. Please make sure you have provided the correct file.
    pause
    exit /b 1
)

set "validpath=llama.cpp\models\"
if not exist "%validpath%%modelname%" (
   echo Error: The file must be a child of the \llama.cpp\models\ directory. Please move your model file and try again.
   pause
   exit /b 1
)


REM Wait for the curl command to finish and capture the response
set "response="
curl --location --request POST "http://localhost:443/v1/chat/completions" ^
--header "Authorization: Bearer %modelpath%" ^
--header "Content-Type: application/json" ^
--data-raw "{\"model\": \"gpt-3.5-turbo\", \"messages\": [{\"role\": \"system\", \"content\": \"You are ChatGPT, a helpful assistant developed by OpenAI.\"}, {\"role\": \"user\", \"content\": \"How are you doing today?\"}]}" > response.json
set /p response=<response.json

REM Print the response and a success message if the curl command succeeded
if %errorlevel% == 0 (
    echo.
    echo --RESPONSE--
    echo %response%
    echo.
    echo --RESULTS--
    echo Curl command was successful!
    echo To use any app with gpt-llama.cpp, please provide the following as the OPENAI_API_KEY:
    echo %modelpath%
) else (
    echo.
    echo Error: Curl command failed!
    echo Is the gpt-llama.cpp server running? Try starting the server and running this script again.
    echo Please check for any errors in the terminal window running the gpt-llama.cpp server.
)

exit /b %errorlevel%

pause
