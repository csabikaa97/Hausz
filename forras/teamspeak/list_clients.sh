#!/bin/bash

expect << EOF
spawn telnet 172.20.128.5 10011
expect -re ".*command\."
send "login serveradmin zT3FOa4V\r"
expect -re ".*msg=ok"
send "use sid=1\r"
expect -re ".*msg=ok"
send "use port=9987\r"
expect -re ".*msg=ok"
send "clientlist\r"
expect -re ".*msg=ok"
send "quit"
EOF