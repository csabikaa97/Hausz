Szükséges parancsok:
    docker export <container_name> -o <output_file>.tar
        Egy Docker containert tar archívumba exportál. Cseréld le a <container_name> paramétert a exportálandó container nevére, és a <output_file> paramétert a kívánt kimeneti fájl nevére.

    docker import <input_file>.tar <repository>:<tag>
        Egy Docker containert importál tar archívumból. Cseréld le az <input_file> paramétert az átmásolandó tar archívum nevére, és a <repository>:<tag> paramétert a kívánt repository és tag nevére az importált container számára.

    docker inspect <container_name> | grep "RepoTag"
        Egy Docker container repository és tag nevét adja vissza. Cseréld le a <container_name> paramétert a megvizsgálandó container nevére. A parancs a container repository és tag nevét adja vissza az alábbi formában: "RepoTag": "<repository>:<tag>".
        
    docker start <container_name>
        Egy Docker container indítása. Cseréld le a <container_name> paramétert az indítandó container nevére.

    docker-compose up
        Az összes olyan container indítása, amelyeket egy docker-compose.yml fájlban definiáltak.
        
    docker-compose start
        Már meglévő példányok indítása azokról a containerekről, amelyeket egy docker-compose.yml fájlban definiáltak.