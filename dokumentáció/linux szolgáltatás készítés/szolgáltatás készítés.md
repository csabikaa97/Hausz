1.  Készítsd egy új ".service" kiterjesztésű fájlt a "/etc/systemd/system/" helyen

2.  Másold be az alábbi templatet a fájlba:

```
[Unit]
Description=
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
ExecStart=

[Install]
WantedBy=multi-user.target
```

3.  Töltsd ki a description és ExecStart részeket

    description:    A szolgáltatás leírása

    ExecStart:      A futtatandó parancs

4.  Opcionális: Meg lehet adni a "user=" paraméterrel a felhasználót amivel futtatni akarod a szolgáltatást. Ez alapból root szokott lenni

5.  Futtasd a ```systemctl daemon-reload``` parancsot a szolgáltatások újratöltéséhez

6.  A ```service <szolgáltatásod neve> status``` paranccsal ellenőrizd hogy felismerte-e a systemd a szolgáltatásod

7.  A ```systemctl enable <szolgáltatásod neve>``` paranccsal engedélyezd boot-nál a szolgáltatás indítását

8.  A ```journalctl -u egyuttnezo_szerver``` tudod ellenőrizni a szolgáltatás kimenetét