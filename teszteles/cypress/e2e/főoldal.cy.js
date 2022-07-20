describe('Főoldal', () => {
    it('oldal betöltése', () => {
        cy.visit('https://hausz.stream/')
    })

    it('Topbar tesztek', () => {
        cy.topbar_teszteles()
    })

    it('Beléptető rendszer tesztek', () => {
        cy.belepteto_rendszer_teszteles()
    })
    
    it('Keresés gomb látható', () => {
        cy.contains('Keressed more')
    })
    
    it('Jó napom van gomb látható', () => {
        cy.contains('Jó napom van more')
    })

    it('Asztali: Hausz újítások lista', () => {
        cy.viewport(1280, 720)
        cy.contains('Újítások a Hauszon')
        .and('be.visible')
        cy.contains('Globális: Sokkal mobilbarátabb az összes oldal')
        .and('be.visible')
    })
})