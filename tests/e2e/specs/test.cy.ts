describe('Navegação pública', () => {
  it('abre a tela de login', () => {
    cy.viewport(390, 844);
    cy.visit('/login');
    cy.contains('h1', 'Entre para acompanhar o consumo em tempo real.').should('be.visible');
    cy.contains('button', 'Entrar').scrollIntoView().should('be.visible');
    cy.contains('a', 'Cadastre-se').should('be.visible');
  });
});
