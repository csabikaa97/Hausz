#!/bin/bash

expect << EOF
spawn telnet 172.20.128.15 10011
expect -re ".*command\."
send "login serveradmin LKMjDYNl\r"
expect -re ".*msg=ok"
send "use sid=1\r"
expect -re ".*msg=ok"
send "use port=9987\r"
expect -re ".*msg=ok"
send "tokenadd tokentype=0 tokenid1=7 tokenid2=0\r"
expect -re ".*msg=ok"
send "quit"
EOF