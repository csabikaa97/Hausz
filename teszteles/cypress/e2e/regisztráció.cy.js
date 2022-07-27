describe('Regisztráció', () => {
    it('Mobil: Navigálás főoldalról', () => {
        cy.viewport(320, 640)
        cy.visit(Cypress.env('domain'))
        cy.get('#topbar').contains('Belépés').and('be.visible').click()
        cy.get('#belepes_doboz').contains('Regisztráció').and('be.visible').click()
    })

    it('Asztali: Regisztrációs oldal tartalom', () => {
        cy.viewport(1280, 720)
        cy.contains('Főoldal').and('be.visible')
        cy.contains('Megosztó').and('be.visible')
        cy.contains('Hausz regisztráció').and('be.visible')
        cy.contains('Adatvédelmi tájékoztató').and('be.visible')
    })

    it('Mobil: Regisztrációs oldal tartalom', () => {
        cy.viewport(320, 640)
        cy.contains('Hausz oldalak').and('be.visible')
        cy.contains('Hausz regisztráció').and('be.visible')
        cy.contains('Adatvédelmi tájékoztató').and('be.visible')
    })

    it('Mobil: Regisztrációhoz szükséges mezők megléte', () => {
        cy.viewport(320, 640)
        cy.wait(250)
        cy.get('#adatvedelmi_tajekoztato_elolvasva_gomb').and('be.visible').click()
        const kisbetuk = "abcdefghijlmnopqrstuvwxyz";
        const nagybetuk = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const szamok = "123456789";
        const kulonleges_karakterek = "_-/=()+!%'\<>,.?:${}@&#~";
        let start = kisbetuk[Math.floor(kisbetuk.length * Math.random())];
        let a = nagybetuk[Math.floor(nagybetuk.length * Math.random())];
        let b = szamok[Math.floor(szamok.length * Math.random())];
        let c = kulonleges_karakterek[Math.floor(kulonleges_karakterek.length * Math.random())];
        let d = "_jelszo";

        cy.get('#jelszoErossegTippek').contains('⚫ Kis betű')
        cy.get('#jelszoErossegTippek').contains('⚫ Nagy betű')
        cy.get('#jelszoErossegTippek').contains('⚫ Szám')
        cy.get('#jelszoErossegTippek').contains('⚫ Különleges karakter')
        cy.get('#jelszoErossegTippek').contains('⚫ Legalább 10 karakter hosszú')
        cy.get('#jelszoErossegTippek').contains('⚫ Új jelszavak egyeznek')
        cy.get('input[id=regisztracio_password]').and('be.visible').type(start)
        cy.get('#jelszoErossegTippek').contains('🟢 Kis betű')
        cy.get('#jelszoErossegTippek').contains('🟠 Nagy betű')
        cy.get('#jelszoErossegTippek').contains('🟠 Szám')
        cy.get('#jelszoErossegTippek').contains('🟠 Különleges karakter')
        cy.get('#jelszoErossegTippek').contains('🟠 Legalább 10 karakter hosszú')
        cy.get('#jelszoErossegTippek').contains('⚫ Új jelszavak egyeznek')
        cy.get('input[id=regisztracio_password]').and('be.visible').type(a)
        cy.get('#jelszoErossegTippek').contains('🟢 Nagy betű')
        cy.get('input[id=regisztracio_password]').and('be.visible').type(b)
        cy.get('#jelszoErossegTippek').contains('🟢 Szám')
        cy.get('input[id=regisztracio_password]').and('be.visible').type(c)
        cy.get('#jelszoErossegTippek').contains('🟢 Különleges karakter')
        cy.get('input[id=regisztracio_password]').and('be.visible').type(d)
        cy.get('input[id=regisztracio_password_confirm]').and('be.visible').type(start)
        cy.get('#jelszoErossegTippek').contains('🔴 Új jelszavak egyeznek')
        cy.get('input[id=regisztracio_password_confirm]').and('be.visible').type(a + b + c + d)
        cy.get('#jelszoErossegTippek').contains('🟢 Új jelszavak egyeznek')

        cy.get('input[id=regisztracio_username]').and('be.visible').type(start + a + b + c + d)
        cy.get('input[id=regisztracio_email]').and('be.visible').type(start + a + b + c + '_AUTOMATA_TESZTELES@' + Cypress.env('domain'))
    })

    it('Mobil: Regisztrációs gomb megléte és funkcionalitás', () => {
        cy.viewport(320, 640)
        cy.get('#regisztracio_gomb').and('be.visible').click()
        cy.contains('Sikeres regisztráció').and('be.visible')
    })

    it('Mobil: Ugrás a főoldalra gomb és funkcionalitása', () => {
        cy.viewport(320, 640)
        cy.contains('Ugrás a főoldalra').and('be.visible').click()
        cy.contains('Keressed').and('be.visible')
    })
})