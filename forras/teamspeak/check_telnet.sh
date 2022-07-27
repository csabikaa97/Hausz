expect << EOF
set timeout 2
spawn telnet 172.20.128.5 10011
expect -re ".*command\."
send "quit\r"
EOF