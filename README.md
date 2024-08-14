# dex223-auto-listing

### Setup project

```bash
git clone https://github.com/kostya12362/dex223-auto-listing
```

```bash
cd dex223-auto-listing && touch .env
```

```bash
NETWORK=<network name>
SUBGRAPH_KEY=<add subgraph secret key>
```

Add file with in `./config/<network name>.js` watch for example in directory

```bash
yarn template
yarn compile
auth:thegraph && graph deploy --studio dex223-auto-listing-$NETWORK
```

```bash
graph test -d
```
