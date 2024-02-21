export class Uzenet<T> {
    eredmeny: string;
    valasz: T;
}

export class SaltEredmeny {
    eredmeny: string;
    salt: string;
}

export class BelepesStatusz {
    eredmeny: string = "";
    session_loggedin: string = "";
    session_username: string = "";
    session_admin: string = "";
}