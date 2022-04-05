#include <stdio.h>

int main() {
	char jatekosok[2][5][255];
	printf("Elso csapat:\n");
	for(int i=0; i<5; i++) {
		printf("%d. jatekos neve:", i+1);
		scanf("%s", jatekosok[0][i]);
	}

	printf("Masodik csapat:\n");
	for(int i=0; i<5; i++) {
                printf("%d. jatekos neve:", i+1);
                scanf("%s", jatekosok[1][i]);
        }

	for(int i=0; i<5; i++) {
		for(int j=0; j<5; j++) {
			printf("%s - %s\n", jatekosok[0][i], jatekosok[1][j]);
		}
	}
	return 0;
}