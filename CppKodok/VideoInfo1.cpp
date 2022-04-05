#include <iostream>

using namespace std;

bool vane(char* szoveg, string keresendo) {
    int length=0;
    while( szoveg[length] != 0 ) {
        length++;
    }

    if(length < 10) {
        return false;
    }

    // DEBUG: cout<<"\""<<szoveg<<"\" length: "<<length<<endl;

    for(int i=0; i<length-keresendo.length(); i++) {
        int matches = 0;
        for(int j=0; j<keresendo.length(); j++) {
            if( szoveg[i+j] == keresendo[j] ) {
                matches++;
            }
        }
        if( matches == keresendo.length() ) {
            return true;
        }
    }
    return false;
}

int main(int argc, char* argv[]) {
    if( argc != 2 ) {
        return 9;
    }

    int flagszam = 21;

    bool usedFlags[flagszam];
    for(int i=0; i<flagszam; i++) {
        usedFlags[i] = false;
    }

    string keresendoFlagek[flagszam] = {
        "720p", 
        "1080p", 
        "2160p", 
        "480p", 
        "4320p", 
        "360p", 
        "240p", 
        "144p", 
        "1440p",
        "60fps",
        "30fps", 
        "24fps",
        "m4a_dash", 
        "mp4", 
        "webm", 
        "avc1", 
        "vp9", 
        "av01", 
        "opus",
        "audio only", 
        "video only"
    };

    string Flagek[flagszam] = {
        "720P", 
        "1080P", 
        "2160P", 
        "480P", 
        "4320P", 
        "360P", 
        "240P", 
        "144P", 
        "1440P",
        "60 fps",
        "30 fps", 
        "24 fps",
        "M4A",
        "MP4", 
        "Webm",  
        "H.264", 
        "VP9", 
        "AV1", 
        "Opus Audio",
        "hang", 
        "videó"
    };

    
    int volt = 0;

    for(int i=0; i<flagszam; i++) {
        // DEBUG: cout<<"Keresendo: "<<keresendoFlagek[i]<<endl;
        if( vane(argv[1], keresendoFlagek[i]) ) {
            usedFlags[i] = true;
        }
    }

    // ha van m4a akkor az mp4-et offolom
    if( usedFlags[12] ) {
        usedFlags[13] = false;
    }

    // felbontasok
    volt = 0;
    for(int i=0; i<9; i++) {
        if( usedFlags[i] ) {
            cout<<Flagek[i]<<endl;
            volt += 1;
        }
    }
    if( !volt ) {
        cout<<"ismeretlen"<<endl;
    }

    // fps
    volt = 0;
    for(int i=9; i<12; i++) {
        if( usedFlags[i] ) {
            cout<<Flagek[i]<<endl;
            volt += 1;
        }
    }
    if( volt == 0 ) {
        cout<<"ismeretlen"<<endl;
    }

    // container
    bool m4a = false;
    volt = 0;
    for(int i=12; i<15; i++) {
        if( usedFlags[i] ) {
            volt += 1;
        }
    }
    if( volt == 0 ) {
        cout<<"ismeretlen"<<endl;
    } else {
        if( volt >= 1 ) {
            for(int i=12; i<15; i++) {
                if( usedFlags[i] ) {
                    if( i == 12 ) {
                        m4a = true;
                    }
                    cout<<Flagek[i]<<endl;
                }
            }
        }
    }

    //codec
    if( m4a ) {
        cout<<"MP4A"<<endl;
    } else {
        volt = 0;
        for(int i=15; i<19; i++) {
            if( usedFlags[i] ) {
                cout<<Flagek[i]<<endl;
                volt += 1;
            }
        }
        if( !volt ) {
            cout<<"ismeretlen"<<endl;
        }
    }

    // media type
    for(int i=19; i<21; i++) {
        if( usedFlags[i] ) {
            cout<<Flagek[i]<<endl;
        }
    }
    if( usedFlags[19] == false && usedFlags[20] == false ) {
        cout<<"videó + hang"<<endl;
    }



    int length=0;
    while( argv[1][length] != 0 ) {
        length++;
    }

    if(length < 10) {
        return 0;
    }
    int index = -1;
    for(int i=0; i<length-1; i++) {
        if( (argv[1][i] <= '9' && argv[1][i] >= '0') && argv[1][i+1] == 'k' ) {
            index = i;
            break;
        }
    }
    if( index == -1 ) {
        cout<<"Ismeretlen bitráta"<<endl;
    } else {
        string temp = "";
        int i = index;
        while( argv[1][i] >= '0' && argv[1][i] <= '9' ) {
            temp = argv[1][i] + temp;
            i = i - 1;
        }
        cout<<temp<<endl;
    }

    

    // fajlmeret kereses
    string atmeneti;
    int j=1;
    while( argv[1][j] != 0 && !( argv[1][j-1] == 'i' && argv[1][j] == 'B' ) ) {
        j++;
    }
    if( argv[1][j] == 0 ) {
        // nincs meret???
        cout<<"Ismeretlen"<<endl;
    } else {
        int k = j;
        while( k != 0 && argv[1][k] != ' ') {
            if( argv[1][k] == 'K' || argv[1][k] == 'G' || argv[1][k] == 'T' || argv[1][k] == 'M' ) {
                atmeneti = argv[1][k] + atmeneti;
                atmeneti = ' ' + atmeneti;
            } else {
                if( argv[1][k] != 'i' ) {
                    atmeneti = argv[1][k] + atmeneti;
                }
            }
            k--;
        }
        cout<<atmeneti<<endl;
    }

    return 0;
}