#include <stdio.h>

int max2(int egyik, int masik) {
	if( egyik > masik ) {
		return egyik;
	} else {
		return masik;
	}
}

int main(int argc, char* argv[]) {
	printf(argv[1]);
	printf("\n");
	printf(argv[2]);
	printf("\n");

	if( argc != 3 ) {
		printf("hulye balfasz\n");
		return 0;
	}

	int elso = 0;
	int masodik = 0;

	while(argv[1][elso] != 0) {
		elso = elso + 1;
	}

	while(argv[2][masodik] != 0) {
		masodik = masodik + 1;
	}

	for(int i=0; i<elso; i++) {
		if( argv[1][i] != '0' && argv[1][i] != '1' ) {
			printf("fuu bazdmeg de hulye vagy\n");
			return 0;
		}
	}

	for(int i=0; i<masodik; i++) {
		if( argv[2][i] != '0' && argv[2][i] != '1' ) {
			printf("fuu badzemg de hulye vagy gecu\n");
			return 0;
		}
	}


	printf("A nagyobb szoveg hossza: %d\n", max2(elso, masodik));
	return 0;
}


