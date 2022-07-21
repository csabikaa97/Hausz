// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('topbar_teszteles', () => {
    cy.viewport(1280, 720)
    cy.contains('Főoldal').and('be.visible')
    cy.contains('Megosztó').and('be.visible')
    cy.viewport(320, 640)
    cy.contains('Hausz oldalak').and('be.visible')
    cy.wait(250)
    cy.contains('Hausz oldalak').and('be.visible').click()
    cy.get('#menu_div').contains('Főoldal').and('be.visible')
    cy.get('#menu_div').contains('Megosztó').and('be.visible')
    cy.get('body').click(0,0)
    cy.wait(250)
})

Cypress.Commands.add('belepteto_rendszer_teszteles', () => {
// Mobil
    cy.viewport(320, 640)
    // Belépés gomb látható
    cy.contains('Belépés').and('be.visible').click()
    // belépés funkció
    cy.contains('Bejelentkezés').and('be.visible')
    cy.contains('Regisztráció').and('be.visible')
    cy.get('input[id=username]').and('be.visible')
    cy.get('input[id=current-password]').and('be.visible')
    cy.belepes()
    cy.contains('Sikeres belépés').and('be.visible')
    cy.get('#felhasznalo_doboz').contains('automata_teszteles').and('be.visible')
    cy.contains('Belépve mint:').and('be.visible')
    cy.contains('Jelszó megváltoztatása').and('be.visible')
    cy.kilepes()
// Asztali
    cy.viewport(1280, 720)      
    // Bejelentkezés gomb látható
    cy.get('#felhasznalo_doboz').contains('Bejelentkezés').and('be.visible')
    // belépés funkció
    cy.contains('Bejelentkezés').and('be.visible')
    cy.contains('Regisztráció').and('be.visible')
    cy.get('input[id=username]').and('be.visible')
    cy.get('input[id=current-password]').and('be.visible')
    cy.belepes()
    cy.contains('Sikeres belépés').and('be.visible')
    cy.get('#felhasznalo_doboz').contains('automata_teszteles').and('be.visible')
    cy.contains('Belépve mint:').and('be.visible')
    cy.contains('Jelszó megváltoztatása').and('be.visible')
    cy.kilepes()
})

Cypress.Commands.add('belepes', () => {
    cy.viewport(1280, 720)
    cy.get('input[id=username]').type("automata_teszteles")
    cy.get('input[id=current-password]').type("automata_teszteles")
    cy.get('button[id=bejelentkezes_gomb]').click()
})

Cypress.Commands.add('kilepes', () => {
    cy.viewport(1280, 720)
    cy.contains('Kilépés').and('be.visible').click()
})