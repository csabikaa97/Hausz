cp /minecraft_build_files/purpur.jar /minecraft/purpur.jar
cp /minecraft_build_files/eula.txt /minecraft/eula.txt
cp -r /minecraft_build_files/plugins /minecraft/plugins
cd /minecraft
exec /jdk/jdk-21.0.1+12/bin/java -XX:+UseLargePages -XX:LargePageSizeInBytes=2M -XX:+UnlockExperimentalVMOptions -XX:+UseShenandoahGC -XX:ShenandoahGCMode=iu -XX:+UseNUMA -XX:+AlwaysPreTouch -XX:+DisableExplicitGC -Dfile.encoding=UTF-8 -server -Xms1G -Xmx1G -jar purpur.jar --nogui