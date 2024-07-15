/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: 'chapel',
  v1: {
    contracts: {
      autoListingsRegistry: {
        name: 'AutoListingsRegistry',
        address: '0x1245c83de3cc16193de8777ed597b677d789ac94'.toLowerCase(),
        startBlock: 41641153
      }
    }
  }
}
