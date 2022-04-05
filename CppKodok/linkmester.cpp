#include <iostream>

using namespace std;

/*
YouTube link példák

http://www.youtube.com/watch?v=-wtIMTCHWuI
http://www.youtube.com/v/-wtIMTCHWuI?version=3&autohide=1
http://youtu.be/-wtIMTCHWuI
http://www.youtube.com/oembed?url=http%3A//www.youtube.com/watch?v%3D-wtIMTCHWuI&format=json
https://www.youtube.com/embed/M7lc1UVf-VE
http://www.youtube.com/attribution_link?a=JdfC0C9V6ZI&u=%2Fwatch%3Fv%3DEhxJLojIE_o%26feature%3Dshare

*/

int main(int argc, char* argv[]) {
	string returnvalue;
	if( argc == 2 ) {
		bool volt = false;
		int i=0;
		while( argv[1][i] != 0 ) {
			if( argv[1][i] == '&' ) {
				break;
			}
			if( argv[1][i] == '=' ) {
				volt = true;
			} else {
				if(volt) {
					returnvalue += argv[1][i];
				}
			}
			i++;
		}
		cout<<returnvalue<<endl;
	} else {
		return 69;
	}
	return 0;
}
