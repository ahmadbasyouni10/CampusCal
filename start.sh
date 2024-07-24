#!/bin/bash
apt-get update
apt-get install -y build-essential cython
python -m pip install --upgrade pip
pip install -r requirements.txt