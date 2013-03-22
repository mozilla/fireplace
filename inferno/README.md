# Inferno

Inferno is a build server that generates a packaged app of Fireplace when
someone pushes to the github.com/mozilla/fireplace repository.

## Get the latest build

http://inferno.paas.allizom.org/

## How it works

1. Someone pushes to the mozilla/fireplace repo.
2. Github sends a ping (from a service hook) to Inferno
3. Inferno downloads the zipball of Fireplace and starts the compilation process
4. The last build is deleted and the new build is served


## How to run it

To install, simply run:

```bash
npm install
```

To start the server, run:

```bash
node app.js
```

That's it!
