/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: 'sepolia',
  v1: {
    contracts: {
      autoListingsRegistry: {
        name: 'AutoListingsRegistry',
        address: '0x3941Ff18fF902B88b16cA8029c0D133Ef262a196'.toLowerCase(),
        startBlock: 6340494
      },
      tokenConverter: {
        name: 'TokenConverter',
        address: '0x1245c83de3cc16193de8777ed597b677d789ac94'.toLowerCase(),
        startBlock: 5814218
      }
    }
  }
}
