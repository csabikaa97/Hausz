describe('Együttnéző', () => {
    it('oldal betöltése', () => {
        cy.visit(Cypress.env('domain') + 'egyuttnezo')
    })

    it('socket csatlakozva', () => {
        cy.contains('🟩')
    })

    it('Kilépve: Irányítások nem léteznek', () => {
        cy.get('#lejatszasgomb').and('not.be.visible');
        cy.get('input[id=video_id_mezo]').and('not.be.visible');
    })
    
    it('Belépve: Irányítások léteznek első belépést követően', () => {
        cy.belepes()
        cy.get('#nev_lista').contains('automata_teszteles').and('be.visible')
        cy.get('#lejatszasgomb').and('be.visible');
        cy.contains('Új videó indítása').and('be.visible');
        cy.get('input[id=video_id_mezo]').and('be.visible');
        cy.kilepes()
        cy.wait(1000)
        cy.get('#nev_lista').contains('automata_teszteles').should('not.exist');
    })

    it('Kilépve: Irányítások nem léteznek kilépést követően', () => {
        cy.get('#lejatszasgomb').and('not.be.visible');
        cy.contains('Új videó indítása').and('not.be.visible');
        cy.get('input[id=video_id_mezo]').and('not.be.visible');
    })

    it('Belépve: Irányítások léteznek második belépést követően is', () => {
        cy.belepes()
        cy.get('#nev_lista').contains('automata_teszteles').and('be.visible')
        cy.get('#lejatszasgomb').and('be.visible');
        cy.contains('Új videó indítása').and('be.visible');
        cy.get('input[id=video_id_mezo]').and('be.visible');
        cy.kilepes()
        cy.wait(1000)
        cy.get('#nev_lista').contains('automata_teszteles').should('not.exist');
    })

    it('Hibás videó link esetén lejátszó hiba jelzése', () => {
        cy.belepes()
        cy.get('#nev_lista').contains('automata_teszteles').and('be.visible')
        cy.get('#nev_lista').contains('automata_teszteles')
        cy.get('#video_id_mezo').and('be.visible').type('https://youtube.com/watch?v=ljPDtDIrfrE')
        cy.get('#uj_video_doboz > button').and('be.visible').click()
        cy.get('#video_id_mezo').and('be.visible').type('https://youtube.com/watch?v=ljPDtDIrjrE')
        cy.get('#uj_video_doboz > button').and('be.visible').click()
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)').contains('automata_teszteles').contains('Új videó > ').and('be.visible')
        cy.get('#parancs_lista').contains('ljPDtDIrjrE').and('be.visible')
        cy.contains('Lejátszó hiba:').and('be.visible')
        cy.kilepes()
        cy.wait(1000)
        cy.get('#nev_lista').contains('automata_teszteles').should('not.exist');
    })

    it('Új videó megfelelő linkkel elindul', () => {
        cy.belepes()
        cy.get('#nev_lista').contains('automata_teszteles').and('be.visible')
        cy.get('#video_id_mezo').and('be.visible').type('https://youtube.com/watch?v=ljPDtDIrfrE')
        cy.get('#uj_video_doboz > button').and('be.visible').click()
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)').contains('automata_teszteles').contains('Új videó > ').and('be.visible')
        cy.get('#parancs_lista').contains('ljPDtDIrfrE').and('be.visible')
        cy.get('#ido').contains(/00:[0-9][0-9]/).and('be.visible')
        cy.get('#ido').contains(/00:[0-9][0-9]/).and('be.visible')
        cy.get('#ido').contains(/00:[0-9][0-9]/).and('be.visible')
        cy.kilepes()
        cy.wait(1000)
        cy.get('#nev_lista').contains('automata_teszteles').should('not.exist');
    })

    it('Új videó megfelelő linkkel és idővel elindul, és jó helyre tekerődik', () => {
        cy.belepes()
        cy.get('#nev_lista').contains('automata_teszteles').and('be.visible')
        cy.get('#video_id_mezo').and('be.visible').type('https://youtube.com/watch?v=ljPDtDIrdsa')
        cy.get('#uj_video_doboz > button').and('be.visible').click()
        cy.get('#video_id_mezo').and('be.visible').type('https://youtube.com/watch?v=ljPDtDIrfrE&t=3100')
        cy.get('#uj_video_doboz > button').and('be.visible').click()
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)')
            .contains('automata_teszteles').and('be.visible')
            .contains(/Tekerés: 51:[0-9][0-9]/).and('be.visible')
            .contains('Új videó > ').and('be.visible')
            .contains('ljPDtDIrfrE').and('be.visible')
        cy.get('#ido').contains(/51:[0-9][0-9]/).and('be.visible')
        cy.get('#ido').contains(/51:[0-9][0-9]/).and('be.visible')
        cy.get('#ido').contains(/51:[0-9][0-9]/).and('be.visible')

        cy.get('#video_id_mezo').and('be.visible').type('https://youtube.com/watch?v=ljPDtDIrdsa')
        cy.get('#uj_video_doboz > button').and('be.visible').click()
        cy.get('#video_id_mezo').and('be.visible').type('https://youtube.com/watch?v=ljPDtDIrfrE&t=1500')
        cy.get('#uj_video_doboz > button').and('be.visible').click()
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)').contains('automata_teszteles').contains('Új videó > ').and('be.visible')
        cy.get('#parancs_lista').contains('ljPDtDIrfrE').and('be.visible')
        cy.get('#ido').contains(/25:[0-9][0-9]/).and('be.visible')
        cy.get('#ido').contains(/25:[0-9][0-9]/).and('be.visible')
        cy.get('#ido').contains(/25:[0-9][0-9]/).and('be.visible')
        cy.kilepes()
        cy.wait(1000)
        cy.get('#nev_lista').contains('automata_teszteles').should('not.exist');
    })

    it('Azonos videó link idővel csak jó helyre tekerődik', () => {
        cy.belepes()
        cy.get('#nev_lista').contains('automata_teszteles').and('be.visible')
        cy.get('#video_id_mezo').and('be.visible').type('https://youtube.com/watch?v=ljPDtDIrdsa')
        cy.get('#uj_video_doboz > button').and('be.visible').click()
        cy.get('#video_id_mezo').and('be.visible').type('https://youtube.com/watch?v=ljPDtDIrfrE&t=3100')
        cy.get('#uj_video_doboz > button').and('be.visible').click()
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)').contains('automata_teszteles').and('be.visible')
        cy.get('#parancs_lista > :nth-child(1)').contains(/Tekerés: 51:[0-9][0-9]/).and('be.visible')
        cy.get('#parancs_lista > :nth-child(1)').contains('Új videó > ').and('be.visible')
        cy.get('#parancs_lista > :nth-child(1)').contains('ljPDtDIrfrE').and('be.visible')

        cy.get('#video_id_mezo').and('be.visible').type('https://youtube.com/watch?v=ljPDtDIrfrE&t=1500')
        cy.get('#uj_video_doboz > button').and('be.visible').click()
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)')
            .contains('automata_teszteles').and('be.visible')
            .contains('Tekerés').contains(/25:[0-9][0-9]/).and('be.visible')
        cy.get('#ido').contains(/25:[0-9][0-9]/).and('be.visible')
        cy.get('#ido').contains(/25:[0-9][0-9]/).and('be.visible')
        cy.get('#ido').contains(/25:[0-9][0-9]/).and('be.visible')
        cy.kilepes()
        cy.wait(1000)
        cy.get('#nev_lista').contains('automata_teszteles').should('not.exist');
    })

    it('Tekerés', () => {
        cy.belepes()

        cy.get('#nev_lista').contains('automata_teszteles').and('be.visible')
        //cy.get('#lejatszasgomb').and('be.visible').contains('⏸')

        cy.get('#csuszka').and('be.visible').click(100,1)
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)').contains('automata_teszteles').contains(/Tekerés: (0:)?00:[0-9][0-9]/).and('be.visible')

        cy.get('#csuszka').and('be.visible').click(200,1)
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)').contains('automata_teszteles').contains(/Tekerés: (0:)?09:[0-9][0-9]/).and('be.visible')

        cy.kilepes()
        cy.wait(1000)
        cy.get('#nev_lista').contains('automata_teszteles').should('not.exist');
    })

    it('Topbar tesztelés', () => {
        cy.topbar_teszteles()
    })
    
    it('Beléptető rendszer tesztelés', () => {
        cy.belepteto_rendszer_teszteles()
    })

    /*
    it('Megállítás / lejátszás gomb funkció', () => {
        cy.belepes()
        cy.get('#nev_lista').contains('automata_teszteles').and('be.visible')

        cy.get('#lejatszasgomb').and('be.visible').click()
        cy.get('#lejatszasgomb').and('be.visible').contains('▶')
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)').contains('automata_teszteles').contains('Megállítás').and('be.visible')
        cy.get('#lejatszasgomb').and('be.visible').click()
        cy.get('#lejatszasgomb').and('be.visible').contains('⏸')
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)').contains('automata_teszteles').contains('Indítás').and('be.visible')
        cy.get('#lejatszasgomb').and('be.visible').click()
        cy.get('#lejatszasgomb').and('be.visible').contains('▶')
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)').contains('automata_teszteles').contains('Megállítás').and('be.visible')
        cy.get('#lejatszasgomb').and('be.visible').click()
        cy.get('#lejatszasgomb').and('be.visible').contains('⏸')
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)').contains('automata_teszteles').contains('Indítás').and('be.visible')
        cy.get('#lejatszasgomb').and('be.visible').click()
        cy.get('#lejatszasgomb').and('be.visible').contains('▶')
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)').contains('automata_teszteles').contains('Megállítás').and('be.visible')
        cy.get('#lejatszasgomb').and('be.visible').click()
        cy.get('#lejatszasgomb').and('be.visible').contains('⏸')
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)').contains('automata_teszteles').contains('Indítás').and('be.visible')
        cy.get('#lejatszasgomb').and('be.visible').click()
        cy.get('#lejatszasgomb').and('be.visible').contains('▶')
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)').contains('automata_teszteles').contains('Megállítás').and('be.visible')
        cy.get('#lejatszasgomb').and('be.visible').click()
        cy.get('#lejatszasgomb').and('be.visible').contains('⏸')
        cy.wait(1000)
        cy.get('#parancs_lista > :nth-child(1)').contains('automata_teszteles').contains('Indítás').and('be.visible')

        cy.kilepes()
        cy.wait(1000)
        cy.get('#nev_lista').contains('automata_teszteles').should('not.exist');
    })
    */
})