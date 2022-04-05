#include <iostream>
#include <fstream>
#include <stdio.h>
#include <cstdlib>
using namespace std;

int main(int argc, char* argv[])
{
    if( argc != 2 ) {
        cout<<"[varazslas] Nincs eleg parameter."<<endl;
        return 69;
    }

    string fajlnev1;
    int i = 0;
    while( argv[1][i] != 0 ) {
        fajlnev1 += argv[1][i];
        i++;
    }

    string fajlnev2 = ".txt";
    string fajlnev = "./logok/" + fajlnev1 + fajlnev2;

    //cout<<"[varazslas] sessionid: "<<fajlnev1<<"\tfajlnev: \"./logok/"<<fajlnev1+fajlnev2<<"\""<<endl;

    ifstream logtxt(fajlnev.c_str());

    if( !logtxt.is_open() ) {
        cout<<"nincs megnyitva a bemeneti fajl xdddau"<<endl;
        return 9;
    }

    string buffer;

    while( !logtxt.eof() ) {
        getline(logtxt, buffer);
        if( buffer[0] <= '9' && buffer[0] >= '0' ) {
            cout<<buffer<<endl;
        }
    }

    logtxt.close();

    string parancs = "rm -f \"./logok/" + fajlnev1 + fajlnev2 + "\"";

    //system(parancs.c_str());

    return 0;
}

