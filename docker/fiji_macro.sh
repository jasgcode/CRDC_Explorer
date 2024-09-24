#!/bin/bash

#qupath $@
#exit

#if [ -z "$(ps -aux | awk '/[/F]iji.app/{print $2}')" ]
#then
#        /Fiji.app/ImageJ-linux64 &
#        FIJI_ID=$!
#        wait $FIJI_ID
#fi

/Fiji.app/ImageJ-linux64 -eval "run('Bio-Formats Importer', 'open=$1 autoscale color_mode=Default view=Hyperstack stack_order=XYCZT')"
