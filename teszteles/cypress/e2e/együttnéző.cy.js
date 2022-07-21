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
    
    it('Belépve: Irányítások léteznek', () => {
        cy.belepes()
        cy.get('#lejatszasgomb').should('be.visible');
        cy.contains('Új videó indítása').should('be.visible');
        cy.get('input[id=video_id_mezo]').should('be.visible');
        cy.kilepes()
    })

    it('Új videó', () => {
        cy.belepes()
        cy.get('#nev_lista').contains('automata_teszteles')
        cy.get('#video_id_mezo').should('be.visible').type('https://youtube.com/watch?v=ljPDtDIrfrE')
        cy.get('#uj_video_doboz > button').should('be.visible').click()
        cy.contains('automata_teszteles:Új videó > ').should('be.visible')
        cy.get('#video_id_mezo').should('be.visible').type('https://youtube.com/watch?v=ljPDtDIrjrE')
        cy.get('#uj_video_doboz > button').should('be.visible').click()
        cy.contains('automata_teszteles:Új videó > ').should('be.visible')
        cy.contains('Lejátszó hiba:').should('be.visible')
        cy.get('#video_id_mezo').should('be.visible').type('https://youtube.com/watch?v=ljPDtDIrfrE')
        cy.get('#uj_video_doboz > button').should('be.visible').click()
        cy.contains('automata_teszteles:Új videó > ').should('be.visible')
        cy.kilepes()
    })

    it('Topbar tesztelés', () => {
        cy.topbar_teszteles()
    })
    
    it('Beléptető rendszer tesztelés', () => {
        cy.belepteto_rendszer_teszteles()
    })
})