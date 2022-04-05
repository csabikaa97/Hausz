#include <iostream>

using namespace std;

int main() {
    string temp;
    getline(cin, temp);

    string tiltottkarakterek = "/\\%*:|\"<>,.;=?#'";
    
    for(int i=0; i<temp.length(); i++) {
        if( temp[i] == ' ' ) {
            cout<<'_';
        } else {
            if( temp[i] > 127 || temp[i] <= 0 ) {
                // na mi legyen?
                //cout<<"nem jo :( -> \""<<temp[i]<<"\""<<endl;
            } else {
                bool tiltott = false;
                for(int j=0; j<tiltottkarakterek.length(); j++) {
                    if( temp[i] == tiltottkarakterek[j] ) {
                        tiltott = true;
                    }
                }
                if( !tiltott ) {
                    //cout<<temp[i]<<" "<<int(temp[i])<<endl;
                    cout<<temp[i];
                } else {
                    //cout<<"tiltott :( -> \""<<temp[i]<<"\""<<endl;
                }
            }
        }
    }
    cout<<endl;

    return 0;
}