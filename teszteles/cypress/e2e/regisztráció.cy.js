describe('Regisztráció', () => {
    it('Mobil: Navigálás főoldalról', () => {
        cy.viewport(320, 640)
        cy.visit('https://hausz.stream/')
        cy.get('#topbar')
            .contains('Belépés')
            .and('be.visible')
            .click()
        cy.get('#belepes_doboz')
            .contains('Regisztráció')
            .and('be.visible')
            .click()
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

    it('Regisztrációhoz szükséges mezők megléte', () => {
        cy.wait(250)
        cy.get('#adatvedelmi_tajekoztato_elolvasva_gomb').and('be.visible').click()
        let r = (Math.random() + 1).toString(36).substring(7);
        cy.get('input[id=regisztracio_username]').and('be.visible')
            .type(r)
        cy.get('input[id=regisztracio_password]').and('be.visible')
            .type(r)
        cy.get('input[id=regisztracio_password_confirm]').and('be.visible')
            .type(r)
        cy.get('input[id=regisztracio_email]').and('be.visible')
            .type(r + '_AUTOMATA_TESZTELES@hausz.stream')
    })

    it('Regisztrációs gomb megléte és funkcionalitás', () => {
        cy.get('#regisztracio_gomb')
            .and('be.visible')
            .click()
        cy.contains('Sikeres regisztráció')
            .and('be.visible')
    })

    it('Ugrás a főoldalra gomb és funkcionalitása', () => {
        cy.contains('Ugrás a főoldalra')
            .and('be.visible')
            .click()
        cy.contains('Keressed')
            .and('be.visible')
    })
})