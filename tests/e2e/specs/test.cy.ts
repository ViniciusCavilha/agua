const expectNoHorizontalOverflow = () => {
  cy.document().then((document) => {
    expect(document.documentElement.scrollWidth).to.be.at.most(document.documentElement.clientWidth + 1)
  })
}

describe('Navegação pública responsiva', () => {
  it('abre a tela de login no celular sem estourar a largura', () => {
    cy.viewport(320, 568);
    cy.visit('/#/login');
    cy.contains('h1', 'Entre para acompanhar o consumo em tempo real.').should('be.visible');
    cy.contains('button', 'Entrar').scrollIntoView().should('be.visible');
    cy.contains('a', 'Cadastre-se').should('be.visible');
    expectNoHorizontalOverflow()
  });

  it('navega entre cadastro, termos e cadastro na mesma aba', () => {
    cy.viewport(390, 844)
    cy.visit('/#/cadastro')
    cy.contains('h1', 'Crie sua conta para começar a monitorar.').should('be.visible')
    cy.contains('a', 'Clique aqui para ver os termos.').click()
    cy.location('hash').should('include', '/termos')
    cy.contains('h1', 'Termos de uso do Água+').should('be.visible')
    cy.contains('a', 'Voltar ao cadastro').click()
    cy.location('hash').should('include', '/cadastro')
    expectNoHorizontalOverflow()
  });

  it('mantém o formulário de login organizado no desktop', () => {
    cy.viewport(1440, 900)
    cy.visit('/#/login')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.contains('button', 'Google').should('be.visible')
    expectNoHorizontalOverflow()
  });
});
