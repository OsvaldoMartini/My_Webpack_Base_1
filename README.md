# Server Side Render

You can download this repository by using the green `Clone or Download` button on the right hand side of this page. This will present you with the option to either clone the repository using Git, or to download it as a zip file.

If you want to download it using git, copy paste the link that is presented to you, then run the following at your terminal:

```
git clone https://github.com/OsvaldoMartini/My_Webpack_Base_1.git

cd My_Webpack_Base_1

npm install
```

## G Suite Toolbox - Dig DNS Dig Tool

https://toolbox.googleapps.com/apps/dig/#AAAA/

## Install:

https://help.dyn.com/how-to-use-binds-dig-tool/
https://www.isc.org/downloads/
##Usage:

```
>dig www.wservices.co.uk +nostats +nocomments +nocmd
>dig www.wservices.co.uk +nostats +nocomments +nocmd
>dig www.wservices.co.uk +nostats +nocomments +nocmd
```

## Videos 49 and 50

Deploymnet of Servers and Node and Webpack Integration

making webpack Middleware.
Creating a Stand Alone Server

```
npm install --save express
```

Install Webpack as Middleware (For Intercept incoming request and hand it off to webpack)

```
npm install --save-dev webpack-dev-middleware@2.0.6
```

## If you get this error:

```
context.compiler.hooks.invalid.tap('WebpackDevMiddleware', invalid);
```

## These Versions really works together

```
  "webpack": "^2.2.0-rc.0",
  "webpack-dev-middleware": "^2.0.6",
  "webpack-dev-server": "^2.2.0-rc.0"
```

## Tests as PRODUCTION

```
SET NODE_ENV=production
Delete folder 'dist'
node server.js
```

## Adding some Authentication or Databasic Logic or anything like that

It is to Add Additional Route ABOVE ..

## I meant: "ABOVE"... "ABOVE ALL WEBPACK INFORMATION"

server.js

```
//Servers Routes...

app.get('/hello', (req, res) => res.send({ hi: 'there' }));

if (process.env.NODE_ENV !== 'production') { ...
```
