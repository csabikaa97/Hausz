describe('Megosztó', () => {
    it('Mobil', () => {
        cy.visit(Cypress.env('domain'))
        cy.viewport(320, 640)
        cy.mobil_belepes()
        cy.get('#oldalak_menu_gomb').and('be.visible').click()
        cy.get('#menu_div > [onclick="location.href = \'/megoszto/\'"]').and('be.visible').click()
        cy.get('#titkositasi_kulcs_doboz').and('be.visible')
        cy.get('#div_szabad_tarhely').and('be.visible')
        cy.get('#szures_gomb').and('be.visible')
        cy.get('#fileToUpload_label').and('be.visible')
        const random_numbers = Math.floor(Math.random() * 1000000000);
        const random_fajlnev = 'teszt_fajl_' + random_numbers + '.txt';
        cy.get('#fileToUpload').attachFile(
            { filePath: 'teszt_fajl.txt', fileName: random_fajlnev, encoding: 'utf-8' }
        );
        cy.get('#fileToUpload_label').and('be.visible').contains(random_fajlnev)
        cy.wait(300)
        cy.get('#SubmitGomb').and('be.visible').click()
        cy.window().its('feltoltes').invoke('call')
        cy.get('#feltoltes_statusz_doboz').and('be.visible')
        cy.wait(300)
        cy.contains("Sikeres").and('be.visible')
    })

    it('Asztali', () => {
        cy.visit(Cypress.env('domain'))
        cy.viewport(1280, 720)
    })
})