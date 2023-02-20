static LOG_PREFIX: &str = "[ FÁJLOK  ] ";

pub fn hozzárendelt_fájl(útvonal: &str) -> &str {
    match útvonal {
        ""                                      => "index.html",
        "index"                                 => "index.html",
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
        "teamspeak/teamspeak.js"                => "teamspeak/teamspeak.js",
        _                                       => {
            println!("{}Nincs hozzáadva a listához a fájl: {}", LOG_PREFIX, útvonal);
            "404.html"
        },
    }
}