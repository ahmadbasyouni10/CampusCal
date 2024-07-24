#!/bin/bash
sudo apt-get update
sudo apt-get install -y build-essential cython
python -m pip install --upgrade pip
pip install -r requirements.txt