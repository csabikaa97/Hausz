1. Generáld le a swap.img fájlt

    ```
    dd if=/dev/zero of=swap.img bs=1024K count=1024
    
    mkswap swap.img
    
    chmod 0600 swap.img
    
    swapon swap.img
    ```

2. Add hozzá az fstab-hoz hogy indításkor használja a generált swap fájlt a rendszer

    ```
    nano /etc/fstab
    
    /swap.img    none    swap    sw    0   0
    ```