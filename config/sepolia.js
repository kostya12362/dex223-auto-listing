/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: 'sepolia',
  v1: {
    contracts: {
      autoListingsRegistry: {
        name: 'AutoListingsRegistry',
        address: '0x4fd0Ff10833D6C90F0995dDEfD10A1EF03B24790'.toLowerCase(),
        startBlock: 6135806,
      },
    },
  },
}
