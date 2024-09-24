#!/bin/bash
#======================================================================
#- IMPLEMENTATION
#-    version         DICOM Web Server (https://biodepot.io/) 0.4
#-    author          Varik Hoang <varikmp.biodepot@gmail.com>
#-    copyright       Copyright (c) BioDepot LLC
#-    license         GNU General Public License
#======================================================================
#  HISTORY
#     2021/12/01 : varikmp - script creation
#     2021/12/08 : varikmp - implemented API and web application
#     2021/12/03 : varikmp - dockerized the web server
#     2021/12/18 : varikmp - add gcloud into docker image
#======================================================================
#  OPTION
#    PROFILER_OUTPUT_DIR # specify the output directory
#    PROFILER_TIME_STEPS # specify the time step each milliseconds
#======================================================================

RED='\e[91m'
GREEN='\e[92m'
YELLOW='\e[93m'
BLANK='\e[39m'
trap '{ echo -e "\n['$GREEN'INFO '$BLANK'] Shutting down DICOM Metadata Web Server..."; }' INT

OTHERS="localhost"

function display_help()
{
cat << EOF  
Usage: $0 -d DATABASE_SERVER 
 Option   Long option             Description
 -h       --help                  Display help
 -b       --browser               Open Firefox browser with Fiji integration
#  -c       --credential-file       Specify the gCloud credential file in JSON format
#  -p       --project-id            Specify the project ID to download
EOF
}

while [ $# -gt 0 ]
do
	ARGUMENT=$1
	case "$ARGUMENT" in
		-h|--help)
			display_help 
			exit;;
		-b|--browser)
			BROWSER_ENABLE="yes"
			shift 1;;
		# -c|--credential-file)
		# 	CREDENTIAL_FILE=$2
		# 	shift 2;;
		# -p|--project-id)
		# 	PROJECT_ID=$2
		# 	shift 2;;
		*)
			OTHERS="$OTHERS $@"
			break;;
	esac
done

DOWNLOAD_DIR=/tmp
if [ -z "$DOWNLOAD_DIR" ]
then
	echo -e "[$YELLOW""WARN "$BLANK"] Could not find the download directory $DOWNLOAD_DIR"
	echo -e "[$YELLOW""WARN "$BLANK"] Setting download directory into $HOME"
else
	echo -e "[$GREEN""INFO "$BLANK"] The download directory $DOWNLOAD_DIR"
fi

# execute the default app switcher
javac /ToggleExecCommandApp.java
java ToggleExecCommandApp &


echo -e "[$GREEN""INFO "$BLANK"] Starting DICOM Metadata Web Server..."

tar -xf /mozilla.tar.gz --directory ~/
mv ~/.config/fiji.desktop /usr/share/applications/
chmod +x /fiji_macro.sh

echo -e "[$GREEN""INFO "$BLANK"] Setting default download directory for firefox to '$DOWNLOAD_DIR'..."

