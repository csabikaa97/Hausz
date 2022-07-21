describe('Megosztó', () => {
    it('Mobil', () => {
        cy.viewport(320, 640)
        cy.visit('https://hausz.stream/')
        cy.mobil_belepes()
        cy.get('#felhasznalo_doboz').contains('Jelszó megváltoztatása').and('be.visible').click()
        cy.contains('Hausz jelszó változtatás')
        cy.wait(250)
        cy.get('#jelszo_valtoztatas_doboz').contains('Add meg az adataid a jelszó megváltoztatásához').and('be.visible')
        cy.get('#jelenlegi_jelszo').and('be.visible')
        cy.get('#uj_jelszo').and('be.visible')
        cy.get('#uj_jelszo_megerosites').and('be.visible')
        cy.get('#password_reset').contains('Jelszó megváltoztatása').and('be.visible')
        //Mobil: Belépés / kilépés változások
        cy.mobil_kilepes()
        cy.get('#hiba_nem_vagy_belepve_doboz > p').and('be.visible')
        cy.mobil_belepes()
        cy.get('#jelszo_valtoztatas_doboz').contains('Add meg az adataid a jelszó megváltoztatásához').and('be.visible')
        //Mobil: Sikeres jelszó változtatás
        cy.get('#topbar').contains('automata_teszteles').and('be.visible')
        cy.get('#jelenlegi_jelszo').and('be.visible').type('automata_teszteles')
        cy.get('#uj_jelszo').and('be.visible').type('uj_jelszo1234')
        cy.get('#uj_jelszo_megerosites').and('be.visible').type('uj_jelszo1234')
        cy.get('#password_reset').contains('Jelszó megváltoztatása').and('be.visible').click()
        cy.get('#ok_jelszo_valtoztatas_sikeres').contains('Jelszavad sikeresen meg lett változtatva').and('be.visible')
        //Mobil: Sikeres jelszó visszaváltoztatás
        cy.get('#topbar').contains('automata_teszteles').and('be.visible')
        cy.get('#jelszovaltoztatasgomb').and('be.visible').click()
        cy.get('#jelenlegi_jelszo').and('be.visible').type('uj_jelszo1234')
        cy.get('#uj_jelszo').and('be.visible').type('automata_teszteles')
        cy.get('#uj_jelszo_megerosites').and('be.visible').type('automata_teszteles')
        cy.get('#password_reset').contains('Jelszó megváltoztatása').and('be.visible').click()
        cy.get('#ok_jelszo_valtoztatas_sikeres').contains('Jelszavad sikeresen meg lett változtatva').and('be.visible')
    })

    it('Asztali', () => {
        cy.viewport(1280, 720)
        cy.visit('https://hausz.stream/')
        cy.belepes()
        cy.get('#felhasznalo_doboz').contains('Jelszó megváltoztatása').and('be.visible').click()
        cy.contains('Hausz jelszó változtatás')
        cy.wait(250)
        cy.get('#jelszo_valtoztatas_doboz').contains('Add meg az adataid a jelszó megváltoztatásához').and('be.visible')
        cy.get('#jelenlegi_jelszo').and('be.visible')
        cy.get('#uj_jelszo').and('be.visible')
        cy.get('#uj_jelszo_megerosites').and('be.visible')
        cy.get('#password_reset').contains('Jelszó megváltoztatása').and('be.visible')
        //Mobil: Belépés / kilépés változások
        cy.kilepes()
        cy.get('#hiba_nem_vagy_belepve_doboz > p').and('be.visible')
        cy.belepes()
        cy.get('#jelszo_valtoztatas_doboz').contains('Add meg az adataid a jelszó megváltoztatásához').and('be.visible')
        //Mobil: Sikeres jelszó változtatás
        cy.get('#felhasznalo_doboz').contains('automata_teszteles').and('be.visible')
        cy.get('#jelenlegi_jelszo').and('be.visible').type('automata_teszteles')
        cy.get('#uj_jelszo').and('be.visible').type('uj_jelszo1234')
        cy.get('#uj_jelszo_megerosites').and('be.visible').type('uj_jelszo1234')
        cy.get('#password_reset').contains('Jelszó megváltoztatása').and('be.visible').click()
        cy.get('#ok_jelszo_valtoztatas_sikeres').contains('Jelszavad sikeresen meg lett változtatva').and('be.visible')
        //Mobil: Sikeres jelszó visszaváltoztatás
        cy.get('#felhasznalo_doboz').contains('automata_teszteles').and('be.visible')
        cy.get('#jelszovaltoztatasgomb').and('be.visible').click()
        cy.get('#jelenlegi_jelszo').and('be.visible').type('uj_jelszo1234')
        cy.get('#uj_jelszo').and('be.visible').type('automata_teszteles')
        cy.get('#uj_jelszo_megerosites').and('be.visible').type('automata_teszteles')
        cy.get('#password_reset').contains('Jelszó megváltoztatása').and('be.visible').click()
        cy.get('#ok_jelszo_valtoztatas_sikeres').contains('Jelszavad sikeresen meg lett változtatva').and('be.visible')
    })
})