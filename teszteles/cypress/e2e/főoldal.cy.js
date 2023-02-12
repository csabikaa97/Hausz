describe('Főoldal', () => {
    it('oldal betöltése', () => {
        cy.visit(Cypress.env('domain'))
    })

    it('Topbar tesztek', () => {
        cy.visit(Cypress.env('domain'))
        cy.topbar_teszteles()
    })

    it('Beléptető rendszer tesztek', () => {
        cy.visit(Cypress.env('domain'))
        cy.belepteto_rendszer_teszteles()
    })
    
    it('Keresés gomb látható', () => {
        cy.visit(Cypress.env('domain'))
        cy.contains('Keresés')
    })
    
    it('Jó napom van gomb látható', () => {
        cy.visit(Cypress.env('domain'))
        cy.contains('Jó napom van!')
    })

    it('Asztali: Hausz újítások lista', () => {
        cy.visit(Cypress.env('domain'))
        cy.viewport(1280, 720)
        cy.contains('Újítások a Hauszon')
        .and('be.visible')
        cy.contains('Globális: Sokkal mobilbarátabb az összes oldal')
        .and('be.visible')
    })
})