describe('Game', () => {
  it('Can see the game name', () => {
    cy.visit('http://localhost:3000')

    cy.contains('The Corn Horn').should('be.visible')
  })
})
