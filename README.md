# dex223-auto-listing

### Setup project
```bash
git clone https://github.com/kostya12362/dex223-auto-listing
```
```
cd dex223-auto-listing && touch .env
```
```
NETWORK=<network name>
SUBGRAPH_KEY=<add subgraph secret key>
```
Add file with in ``./config/<network name>.js`` watch for example in directory
```bash
yarn template
yarn compile
graph deploy --node https://api.studio.thegraph.com/deploy/ <subgraph name>
```
