#!/bin/bash
port=443

# Prompt the user to drag and drop the location of the Llama-based model (.bin) and read it from standard input
echo "--GPT-LLAMA.CPP TEST INSTALLATION SCRIPT LAUNCHED--"
echo "PLEASE MAKE SURE THAT A LOCAL GPT-LLAMA.CPP SERVER IS STARTED. OPEN A SEPARATE TERMINAL WINDOW START IT.\n"
read -p "What port is your server running on? (press enter for default 443 port): " port
read -p "Please drag and drop the location of your Llama-based Model (.bin) here and press enter: " path

# Check if the file exists
if [ ! -f "$path" ]; then
    echo "Error: The file does not exist. Please make sure you have provided the correct path."
    exit 1
fi

# Check if the file has a .bin extension
if [[ "$path" != *.bin ]]; then
    echo "Error: The file extension is not .bin. Please make sure you have provided the correct file."
    exit 1
fi

# Validate that the file is a child of the /llama.cpp/models/ directory
if [[ "$path" != *"/llama.cpp/models/"* ]]; then
    echo "Error: The file must be a child of the /llama.cpp/models/ directory. Please move your model file and try again."
    exit 1
fi

# Wait for the curl command to finish and capture the response
response=$(curl --location --request POST "http://localhost:$port/v1/chat/completions" \
--header "Authorization: Bearer $path" \
--header 'Content-Type: application/json' \
--data-raw '{
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
}')

# Print the response and a success message if the curl command succeeded
if [[ $? -eq 0 ]]; then
    echo ""
    echo "--RESPONSE--"
    echo "$response"
    echo ""
    echo "--RESULTS--"
    echo "Curl command was successful!"
    echo "To use any app with gpt-llama.cpp, please provide the following as the OPENAI_API_KEY:"
    echo "$path"
else
    echo ""
    echo "Error: Curl command failed!"
    echo "Is the gpt-llama.cpp server running? Try starting the server and running this script again."
    echo "Make sure you are testing on the right port. The Curl commmand server error port should match your port in the gpt-llama.cpp window."
    echo "Please check for any errors in the terminal window running the gpt-llama.cpp server."
fi