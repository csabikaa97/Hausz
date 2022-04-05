#include <iostream>

using namespace std;

int main( int argc, char* argv[] ) {
    if( argc != 2 ) {
        return 69;
    }
    bool mp4 = false;
    bool webm = false;

    int j=0;
    while( argv[1][j] != 0 ) {
        j++;
    }

    int i = 2;
    while( argv[1][i] != 0 && !webm && !mp4 && i+3 <= j ) {
        if( argv[1][i] == 'w' && argv[1][i+1] == 'e' && argv[1][i+2] == 'b' && argv[1][i+3] == 'm' ) {
            webm = true;
        }
        if( argv[1][i] == 'm' && argv[1][i+1] == 'p' && argv[1][i+2] == '4') {
            mp4 = true;
        }
        i++;
    }

    if(mp4) {
        cout<<"mp4"<<endl;
    }
    if(webm) {
        cout<<"webm"<<endl;
    }
    return 0;
}