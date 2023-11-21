# 1. install on first server

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=v1.26.10+k3s2 \
K3S_TOKEN=df5f3e05b3ee02575916cef5fa3565cd5edb0c002dad7a4820abc6c10c8cfd10 \
INSTALL_K3S_EXEC="--kube-apiserver-arg default-not-ready-toleration-seconds=15 --kube-apiserver-arg default-unreachable-toleration-seconds=15 --kube-controller-arg node-monitor-period=10s --kube-controller-arg node-monitor-grace-period=10s --kubelet-arg node-status-update-frequency=3s" \
sh -s - server \
    --cluster-init
```
A sok argumentum azért van hogy gyorsabban reagáljon a kubernetes a node-ok leállására.
- https://web.archive.org/web/20220910051513/https://medium.com/tailwinds-navigator/kubernetes-tip-how-to-make-kubernetes-react-faster-when-nodes-fail-1e248e184890
- https://medium.com/tailwinds-navigator/kubernetes-tip-how-to-make-kubernetes-react-faster-when-nodes-fail-1e248e184890

# 2. install on other servers

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=v1.26.10+k3s2 K3S_TOKEN=df5f3e05b3ee02575916cef5fa3565cd5edb0c002dad7a4820abc6c10c8cfd10 \
INSTALL_K3S_EXEC="--kube-apiserver-arg default-not-ready-toleration-seconds=15 --kube-apiserver-arg default-unreachable-toleration-seconds=15 --kube-controller-arg node-monitor-period=10s --kube-controller-arg node-monitor-grace-period=10s --kubelet-arg node-status-update-frequency=3s" \
sh -s - server \
    --server https://192.168.0.40:6443
```

# 3. Define kubeconfig for kubectl

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

# 4. install rancher (optional)

```bash
kubectl apply --validate=false -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.crds.yaml
helm search repo cert-manager
helm install cert-manager jetstack/cert-manager
helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
helm search repo rancher
helm install rancher rancher-stable/rancher --namespace cattle-system --set hostname=hausz.local
```
# 5. container image copying
- docker save
```bash
docker save --output hausz_<container_nev>.tar hausz_<container_nev>:latest
```
- Import image in k3s
```bash
k3s ctr images import ./hausz_<container_nev>.tar
```

# 6. kulcsok másolása webszerverre

```bash
scp ./privkey.pem csabikaa97@node1:/home/csabikaa97/hausz/public/ ; scp ./fullchain.pem csabikaa97@node1:/home/csabikaa97/hausz/public/
scp ./privkey.pem csabikaa97@node2:/home/csabikaa97/hausz/public/ ; scp ./fullchain.pem csabikaa97@node2:/home/csabikaa97/hausz/public/
scp ./privkey.pem csabikaa97@node3:/home/csabikaa97/hausz/public/ ; scp ./fullchain.pem csabikaa97@node3:/home/csabikaa97/hausz/public/
```

# 7. Rook install

```bash
git clone --single-branch --branch release-1.12 https://github.com/rook/rook.git
cd rook/deploy/examples
kubectl create -f crds.yaml -f common.yaml -f operator.yaml
```

Várni kell amíg a rook-ceph-operator pod elindul

```bash
kubectl create -f cluster.yaml
```

# 8. Ceph toolbox indítása

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

```bash
examples/csi/cephfs# kubectl apply -f storageclass.yaml
rook/deploy/examples# kubectl apply -f filesystem.yaml
kubectl get sc
kubectl patch storageclass rook-cephfs -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
kubectl patch storageclass local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
```

# 9. adatbázis inicializálása

Alapból a mysql docker image nem inicalizálja az adatbázist, ezért azt manuálisan kell megcsinálnunk.
1.  Át kell írni az adatbázist tartalmazó deploymentekben a "command" rész a következőre:
    ```yaml
    command:
    - sleep
    - "360000"
    ```
2. Ezután a módosított deploymentet újra kell indítani
3. Be kell lépni a következő paranccsal a mysql konténerbe:
    ```bash
    kubectl exec -it <mysql_pod_neve> -- /bin/bash
    ```
4. Be kell lépni a mysql-be:
    ```bash
    mysqld --initialize
    ```

nano ./var/lib/rancher/k3s/server/manifests/local-storage.yaml
^ ebben a fájlban át kell írni a default-ot true-tól false-ra:
    ```storageclass.kubernetes.io/is-default-class: "false"``` -> ```"true"```

# 10. metallb telepítése (bare metal load balancer)

Beépített load balancer letiltás k3s szolgáltatásban:

nano /etc/systemd/system/k3s.service
```server \``` -> ```server --disable servicelb \```

```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.12/config/manifests/metallb-native.yaml
kubectl create -f metallb-ip-range.yaml
kubectl create -f metallb-layer2-ad.yaml
```
