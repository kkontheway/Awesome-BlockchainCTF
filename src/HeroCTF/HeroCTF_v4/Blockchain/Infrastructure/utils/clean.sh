#!/bin/bash

# Stop nodes and clean associated files
pkill geth
sleep 2
rm -rf node1/ node2/ node*.log miner_node.txt pub_key.txt melchain.json
