export class Uzenet<T> {
    eredmeny: string;
    valasz: T;
}

export class SaltEredmeny {
    eredmeny: string;
    salt: string;
}

export class BelepesStatusz {
    loggedin: boolean = false;
    username: string = "";
    admin: boolean = false;
}