# Yule Log

To create a new Yule Log package for production:

```bash
make log
make submit
make approve
```

For -dev:

```bash
NAME='Dev' DOMAIN='marketplace-dev.allizom.org' make log
DOMAIN='marketplace-dev.allizom.org' make submit
DOMAIN='marketplace-dev.allizom.org' make approve
```

For stage:

```bash
NAME='Stage' DOMAIN='marketplace.allizom.org' make log
DOMAIN='marketplace.allizom.org' make submit
DOMAIN='marketplace.allizom.org' make approve
```
