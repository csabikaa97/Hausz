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
        "robots.txt"                            => "robots.txt",
        ""                                      => "index.html",
        "index"                                 => "index.html",
        "minecraft"                             => "minecraft/minecraft.html",
        "minecraft/minecraft.js"                => "minecraft/minecraft.js",
        "hauszkft"                              => "hauszkft/hauszkft.html",
        "hauszkft/hauszkft.js"                  => "hauszkft/hauszkft.js",
        "hauszkft/indexstilus.css"              => "hauszkft/indexstilus.css",
        "hauszkft/hatter.gif"                   => "hauszkft/hatter.gif",
        "erettsegiszamlalo"                     => "erettsegiszamlalo/erettsegiszamlalo.html",
        "erettsegiszamlalo/erettsegiszamlalo.js" => "erettsegiszamlalo/erettsegiszamlalo.js",
        "erettsegiszamlalo/ErettsegiStyle.css"  => "erettsegiszamlalo/ErettsegiStyle.css",
        "erettsegiszamlalo/ErettsegiWallpaper.jpg"       => "erettsegiszamlalo/ErettsegiWallpaper.jpg",
        "webjosda"                              => "webjosda/josda.html",
        "webjosda/josda.js"                     => "webjosda/josda.js",
        "fizetos"                               => "webjosda/fizetos.html",
        "webjosda/fizetos.js"                   => "webjosda/fizetos.js",
        "webjosda/josdastyle.css"               => "webjosda/josdastyle.css",
        "webjosda/gif.gif"                      => "webjosda/gif.gif",
        "megoszto"                              => "megoszto/megoszto.html",
        "teamspeak"                             => "teamspeak/teamspeak.html",
        "teamspeak/teamspeak.js"                => "teamspeak/teamspeak.js",
        "teamspeak/fiok_varazslo"               => "teamspeak/fiok_varazslo/fiok_varazslo.html",
        "teamspeak/fiok_varazslo/fiok_varazslo.js"       => "teamspeak/fiok_varazslo/fiok_varazslo.js",
        "index/favicon.png"                     => "index/favicon.png",
        "index/alapok.css"                      => "index/alapok.css",
        "index/style.css"                       => "index/style.css",
        "index/hausz.svg"                       => "index/hausz.svg",
        "index/index.js"                        => "index/index.js",
        "megoszto/megoszto.js"                  => "megoszto/megoszto.js",
        "komponensek/topbar.html"               => "komponensek/topbar.html",
        "komponensek/belepteto_rendszer.html"   => "komponensek/belepteto_rendszer.html",
        "komponensek/crypto.js"                 => "komponensek/crypto.js",
        "komponensek/crypto.js.LICENSE.txt"     => "komponensek/crypto.js.LICENSE.txt",
        "favicon.ico"                           => "favicon.ico",
        "kezelo/jelszo_valtoztatas.html"        => "kezelo/jelszo_valtoztatas.html",
        "kezelo/jelszo_valtoztatas.js"          => "kezelo/jelszo_valtoztatas.js",
        "kezelo/regisztracio.html"              => "/kezelo/regisztracio.html",
        "kezelo/regisztracio.js"                => "/kezelo/regisztracio.js",
        "kezelo/meghivo.html"                   => "/kezelo/meghivo.html",
        "kezelo/meghivo.js"                     => "/kezelo/meghivo.js",
        "admin/admin.html"                      => "/admin/admin.html",
        "admin/admin.js"                        => "/admin/admin.js",
        // "" => "",
        _ => {
            "404.html"
        },
    }
}