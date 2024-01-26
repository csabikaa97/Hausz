# Kubernetes cluster telepítése K3S segítségével

## 1. Telepítés az első szerveren

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=v1.26.10+k3s2 \
K3S_TOKEN=df5f3e05b3ee02575916cef5fa3565cd5edb0c002dad7a4820abc6c10c8cfd10 \
INSTALL_K3S_EXEC="--disable=servicelb --kube-apiserver-arg default-not-ready-toleration-seconds=60 --kube-apiserver-arg default-unreachable-toleration-seconds=60 --kube-controller-arg node-monitor-period=10s --kube-controller-arg pod-eviction-timeout=20s --kube-controller-arg node-monitor-grace-period=30s --kubelet-arg node-status-update-frequency=3s" \
sh -s - server \
    --cluster-init
```
A sok argumentum azért van hogy gyorsabban reagáljon a kubernetes a node-ok leállására.
- https://web.archive.org/web/20220910051513/https://medium.com/tailwinds-navigator/kubernetes-tip-how-to-make-kubernetes-react-faster-when-nodes-fail-1e248e184890
- https://medium.com/tailwinds-navigator/kubernetes-tip-how-to-make-kubernetes-react-faster-when-nodes-fail-1e248e184890

# 2. Telepítés többi szerveren

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=v1.26.10+k3s2 K3S_TOKEN=df5f3e05b3ee02575916cef5fa3565cd5edb0c002dad7a4820abc6c10c8cfd10 \
INSTALL_K3S_EXEC="--disable=servicelb --kube-apiserver-arg default-not-ready-toleration-seconds=60 --kube-apiserver-arg default-unreachable-toleration-seconds=60 --kube-controller-arg node-monitor-period=10s --kube-controller-arg pod-eviction-timeout=20s --kube-controller-arg node-monitor-grace-period=30s --kubelet-arg node-status-update-frequency=3s" \
sh -s - server \
    --server https://192.168.0.43:6443
```

# 3. Metallb load balancer telepítése

```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.12/config/manifests/metallb-native.yaml
cd k8s/egyszeri_konfiguraciok
kubectl create -f metallb-ip-range.yaml
kubectl create -f metallb-layer2-ad.yaml
```

A kubectl create parancsokhoz szükséges yaml fájlok az [egyszeri_konfiguraciok](egyszeri_konfiguraciok) mappában vannak.

# 4. Rook Ceph tárhely telepítése

```bash
git clone --single-branch --branch release-1.12 https://github.com/rook/rook.git
cd rook/deploy/examples
kubectl create -f crds.yaml -f common.yaml -f operator.yaml
```

Várni kell amíg a rook-ceph-operator pod elindul

```bash
kubectl create -f cluster.yaml
```

Telepíteni kell a storageclassokat, és beállítani az alapértelmezett storageclassot

```bash
kubectl apply -f rook/deploy/examples/csi/cephfs/storageclass.yaml
kubectl apply -f rook/deploy/examples/filesystem.yaml
kubectl get sc
kubectl patch storageclass rook-cephfs -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
kubectl patch storageclass local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
```

Telepíteni kell a dashboard load balancert

```bash
kubectl apply -f egyszeri_konfiguraciok/rook-dashboard-loadbalancer.yaml
```

A dashboard belépési adatok: admin / <jelszó a következő parancsból>

```bash
kubectl -n rook-ceph get secret rook-ceph-dashboard-password -o jsonpath="{['data']['password']}" | base64 --decode && echo
```

# 5. Ceph toolbox használata

```bash
kubectl create -f deploy/examples/toolbox.yaml
kubectl -n rook-ceph rollout status deploy/rook-ceph-tools
kubectl -n rook-ceph exec -it deploy/rook-ceph-tools -- /bin/bash
```

Itt lehet parancsokat futtatni a ceph clusteren.
Példák:
- ceph status
- ceph osd status
- ceph df

```bash
kubectl -n rook-ceph delete deploy/rook-ceph-tools
```

# 6. Adatbázisok inicializálása

Alapból a mysql docker image nem inicalizálja az adatbázist, ezért azt manuálisan kell megcsinálnunk.
1.  Át kell írni az adatbázist tartalmazó deploymentekben a "command" rész a következőre:
    ```yaml
    command:
    - sleep
    - "360000"
    ```

    VAGY

    ```kubectl run hausz-adatbazis --image=hausz_adatbazis:latest --image-pull-policy=Never --restart=Never -- /bin/sh -c "sleep 360000"```
2. Ezután a módosított deploymentet újra kell indítani
3. Be kell lépni a következő paranccsal a mysql konténerbe:
    ```bash
    kubectl exec -it <mysql_pod_neve> -- /bin/bash
    ```
4. Be kell lépni a mysql-be:
    ```bash
    mysqld --initialize
    ```
5. Itt vagy vissza lehet állítani egy biztonsági mentést, vagy a következő parancsokkal új adatbázist lehet létrehozni:
    ```bash
    mysqld &
    mysql -u root -p
    /telepites/telepites.sh
    ```

# 7. container image készítés és másolás docker-compose környezetből

- docker-compose build
```bash
# build the basic images
docker-compose build

# build the images of non autostart containers
docker-compose build adatbazis-slave ; docker-compose build csomagolas ; docker-compose build karbantarto ; docker-compose build minecraft-server ; docker-compose build navidrome ; docker-compose build vaultwarden ; docker-compose build pihole ; docker-compose build vpn
```

- docker save
```bash
docker save --output hausz_<container_nev>.tar hausz_<container_nev>:latest
```

```bash
docker save --output adatbazis.tar hausz_adatbazis:latest
docker save --output adatbazis-slave.tar hausz_adatbazis_slave:latest
docker save --output kiadas.tar hausz_kiadas:latest
docker save --output csomagolas.tar hausz_csomagolas:latest
docker save --output teamspeak_adatbazis.tar hausz_teamspeak_adatbazis:latest
docker save --output teamspeak.tar hausz_teamspeak:latest
docker save --output torrent-tracker.tar hausz_torrent-tracker:latest
docker save --output webszerver.tar hausz_webszerver:latest
docker save --output karbantarto.tar hausz_karbantarto:latest
docker save --output minecraft-server.tar hausz_minecraft-server:latest
docker save --output navidrome.tar hausz_navidrome:latest
docker save --output vaultwarden.tar hausz_vaultwarden:latest
docker save --output pihole.tar hausz_pihole:latest
docker save --output vpn.tar hausz_vpn:latest
```
- Import image in k3s
```bash
k3s ctr images import ./hausz_<container_nev>.tar
```

```bash
k3s ctr images import adatbazis.tar
k3s ctr images import adatbazis-slave.tar
k3s ctr images import kiadas.tar
k3s ctr images import csomagolas.tar
k3s ctr images import teamspeak_adatbazis.tar
k3s ctr images import teamspeak.tar
k3s ctr images import torrent-tracker.tar
k3s ctr images import webszerver.tar
k3s ctr images import karbantarto.tar
k3s ctr images import minecraft-server.tar
k3s ctr images import navidrome.tar
k3s ctr images import vaultwarden.tar
k3s ctr images import pihole.tar
k3s ctr images import vpn.tar
```

# 8. Traefik TLS tanúsítványok megadása

https://doc.traefik.io/traefik/v1.7/user-guide/kubernetes/#add-a-tls-certificate-to-the-ingress

1. Hozzá kell adni a tanúsítványt a kubernetes clusterhez
```bash
kubectl -n kube-system create secret tls traefik-ssl-tanusitvany --key=privkey.pem --cert=fullchain.pem
```

2. El kell készíteni a Traefik TLSStore CRD-t a clusteren belül
```bash
kubectl apply -f k8s/egyszeri_konfiguraciok/ssl-tanusitvany-secret.yaml
```

[ssl-tanusitvany-secret.yaml](/k8s/egyszeri_konfiguraciok/ssl-tanusitvany-secret.yaml)

# Egyebek

KUBECONFIG definíció Helm használatához

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

# 9. Hausz namespace hozzáadása és alkalmazások indítása

```bash
kubectl create namespace hausz
kubectl create -f k8s/konfiguraciok/
```