#!/bin/bash

# Export the current commit ID, branch, and remote that the build was made from
# Fetch the current commit ID, branch, and remote information from the Git repository
export GIT_FETCH_HEAD=`cat .git/FETCH_HEAD`

# Initialize the result string which will hold all environment variables as a JavaScript object
RESULT='window.env = {'

# Append each environment variable to the 'RESULT' object in key-value format
RESULT+='"API_URL": "'$API_URL    # URL for the API endpoint
RESULT+='", "OAUTH_CLIENT_ID": "'$OAUTH_CLIENT_ID    # OAuth client ID for authentication
RESULT+='", "OAUTH_TOKEN_URL": "'$OAUTH_TOKEN_URL    # URL for obtaining OAuth tokens
RESULT+='", "MAP_API_KEY": "'$MAP_API_KEY    # API key for map services
RESULT+='", "GEO_CODE_API": "'$GEO_CODE_API    # API URL for geocoding services
RESULT+='", "ALERT_SOCKET_URL": "'$ALERT_SOCKET_URL    # WebSocket URL for alert notifications
RESULT+='", "SHIPMENT_URL": "'$SHIPMENT_URL    # URL related to shipment services
RESULT+='", "CUSTODIAN_URL": "'$CUSTODIAN_URL    # URL related to custodians
RESULT+='", "VERSION_NOTES": "'$VERSION_NOTES    # Notes regarding the current version of the app
RESULT+='", "EMAIL_REPORT_URL": "'$EMAIL_REPORT_URL    # URL for email report generation
RESULT+='", "WHATSAPP_CHARGES_URL": "'$WHATSAPP_CHARGES_URL    # URL for WhatsApp charges information
RESULT+='", "CUSTODIAN_TEMPLATE_URL": "'$CUSTODIAN_TEMPLATE_URL    # URL for custodians' template
RESULT+='", "WHATSAPP_MSG_COST": '$WHATSAPP_MSG_COST    # Cost for sending WhatsApp messages
RESULT+=', "session_timeout": '$SESSION_TIMEOUT    # Session timeout duration
RESULT+=', "hide_notification": '$HIDE_NOTIFICATION    # Whether notifications should be hidden
RESULT+=', "production": '$PRODUCTION    # Flag indicating whether the environment is production or not
RESULT+='}'

# List the files in the 'dist' directory (could be used for logging or checking build artifacts)
PATH=`ls dist/`

# Set the output path where the generated 'environment.js' file will be stored
OUTPUTPATH="dist/environment.js"

# Write the generated environment JavaScript object into the output file 'environment.js'
# The file will have a global `window.env` object that can be accessed in the frontend
echo $RESULT > $OUTPUTPATH
