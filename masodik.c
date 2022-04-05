#include <stdio.h>

int main(int argc, char* argv[]) {
        if(argc != 2) {
                printf("Egy parameter kell!");
        }

        int hossz = 0;
        while(argv[1][hossz] != 0) {
                hossz = hossz + 1;
        }

        int kiirandohossz = hossz / 2;

	int valami = 0;
        for(int i=0; i<kiirandohossz; i++) {
                for(int j=valami; j<valami+kiirandohossz+1; j++) {
                        printf("%c", argv[1][j]);
                }
		valami++;
                printf("\n");
        }
        return 0;
}
