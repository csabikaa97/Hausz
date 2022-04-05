#include <stdio.h>

int main(int argc, char* argv[]) {
	int hossz = 0;
	if(argc != 2) {
		printf("egy parameter kell!\n");
		return 0;
	}

	while(argv[1][hossz] >= '0' && argv[1][hossz] <= '9') {
		hossz = hossz + 1;
	}

	int dolog = 1;
	int szam = 0;
	for(int i=0; i<hossz; i++) {
		szam = szam + (argv[1][hossz-i-1]-48)*dolog;
		dolog = dolog * 10;
	}

	printf("%d nem trivialis osztoi: \n", szam);
	for(int i=2; i<szam; i++) {
		if(szam % i == 0) {
			printf("%d ",i);
		}
	}
	printf("\n");
	return 0;
}
