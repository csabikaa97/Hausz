expect << EOF
set timeout 2
spawn telnet 127.0.0.1 10011
expect -re ".*command\."
send "quit\r"
EOF