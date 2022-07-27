expect << EOF
set timeout 2
spawn telnet 172.20.128.15 10011
expect -re ".*command\."
send "quit\r"
EOF