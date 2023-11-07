/// <reference path="../komponensek/alap_fuggvenyek.ts" />


function topbar_betoltese() {
    fetch("/komponensek/topbar.html")
    .then(response => response.text())
    .then(text => {
        document.body.innerHTML = text + document.body.innerHTML;

        document.head.innerHTML += '<meta name="theme-color" media="(prefers-color-scheme: light)" content="rgb(245,245,245)">';
        document.head.innerHTML += '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="rgb(30,30,30)">';

        let menu_div = obj('menu_div');
        menu_div.style.visibility = 'hidden';
        document.onclick = (event) => {
            let menure_kattintott = false;
            event.composedPath().forEach(element => {
                if( element == obj('oldalak_menu_gomb') ) {
                    menure_kattintott = true;
                }
                
                if(menure_kattintott) {
                    menu_div.style.visibility = 'visible';
                    menu_div.style.animation = 'height-novekedes-sigmoid 0.3s ease 1 forwards';
                    eloterbe_helyezes( [obj('menu_div')], true, undefined );
                } else {
                    if( menu_div.style.visibility != 'hidden' ) {
                        menu_div.style.visibility = 'visible';
                        menu_div.style.animation = 'height-csokkenes-sigmoid 0.3s ease 1 forwards';
                        eloterbe_helyezes_vege();
                    }
                }
            });
        }
    });
}