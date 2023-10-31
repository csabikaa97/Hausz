static LOG_PREFIX: &str = "[fájlok   ] ";

pub fn hozzárendelt_fájl(útvonal: &str) -> &str {
    let útvonal = if útvonal.starts_with("/") {
        &útvonal[1..]
    } else {
        útvonal
    };

    let útvonal = if útvonal.ends_with("/") {
        &útvonal[..útvonal.len()-1]
    } else {
        útvonal
    };

    match útvonal {
        ""                                      => "index.html",
        "index"                                 => "index.html",
        "minecraft"                             => "minecraft/minecraft.html",
        "minecraft/minecraft.js"                => "minecraft/minecraft.js",
        "megoszto"                              => "megoszto/megoszto.html",
        "teamspeak"                             => "teamspeak/teamspeak.html",
        "index/favicon.png"                     => "index/favicon.png",
        "index/alapok.css"                      => "index/alapok.css",
        "index/style.css"                       => "index/style.css",
        "index/hausz.svg"                       => "index/hausz.svg",
        "index/index.js"                        => "index/index.js",
        "megoszto/megoszto.js"                  => "megoszto/megoszto.js",
        "komponensek/topbar.html"               => "komponensek/topbar.html",
        "komponensek/belepteto_rendszer.html"   => "komponensek/belepteto_rendszer.html",
        "komponensek/sha256.js"                 => "komponensek/sha256.js",
        "teamspeak/teamspeak.js"                => "teamspeak/teamspeak.js",
        "favicon.ico"                           => "favicon.ico",
        "kezelo/jelszo_valtoztatas.html"        => "kezelo/jelszo_valtoztatas.html",
        "kezelo/jelszo_valtoztatas.js"          => "kezelo/jelszo_valtoztatas.js",
        _ => {
            println!("{}Nincs hozzáadva a listához a fájl: {}", LOG_PREFIX, útvonal);
            "404.html"
        },
    }
}