#include <iostream>

using namespace std;

int main() {
	string buffer;
	cin>>buffer;
	for(int i=0;i<buffer.length(); i++) {
		if( buffer[i] <= '9' && buffer[i] >= '0' ) {
			cout<<buffer[i];
		} else {
			cout<<endl;
			return 0;
		}
	}
	cout<<endl;
}
