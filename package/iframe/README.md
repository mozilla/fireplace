# iframed Package

To create an iframed package, submit it, and approve it:

```bash
make iframe_package
make submit
make approve
```

You can pass in the ```SERVER``` environment variable to have the built iframe
point to a different website. Options are listed ```packageConfig``` in the
[config file](https://github.com/mozilla/fireplace/blob/master/config.js).

```bash
SERVER=dev make iframe_package
```
