#!/bin/bash
xhost +

cp docker/Dockerfile .
sudo docker-compose build
sudo docker-compose down
sudo docker-compose up
#sudo docker-compose up --build
rm Dockerfile


