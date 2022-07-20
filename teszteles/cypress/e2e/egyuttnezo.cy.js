describe('Együttnéző', () => {
    it('oldal betöltése', () => {
        cy.visit('https://hausz.stream/egyuttnezo')
    })

    it('socket csatlakozva', () => {
        cy.contains('🟩')
    })

    it('Kilépve: Irányítások nem léteznek', () => {
        cy.get('#lejatszasgomb').should('not.be.visible');
        cy.contains('Új videó indítása').should('not.be.visible');
        cy.get('input[id=video_id_mezo]').should('not.be.visible');
    })
    
    it('player működés', () => {
        cy.wait(5000)
        cy.get('#video_link').should('have.text', 'Rampage 2022 - IMANU B2B Buunshin')
    })
    
    it('Belépve: Irányítások léteznek', () => {
        cy.belepes()
        cy.get('#lejatszasgomb').should('be.visible');
        cy.contains('Új videó indítása').should('be.visible');
        cy.get('input[id=video_id_mezo]').should('be.visible');
        cy.kilepes()
    })


    it('Topbar tesztelés', () => {
        cy.topbar_teszteles()
    })

    it('Beléptető rendszer tesztelés', () => {
        cy.belepteto_rendszer_teszteles()
    })
})