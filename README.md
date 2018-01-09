# Simple NodeJS app with Docker

This is a demo of NodeJS app that will be running on Docker. This is the `start` branch – we already have our app, but it is still not "dockerized" yet.

## Start

Run `npm start`

## API

`GET /products` Returns list of all available products.

`POST /products` Adds new product. Required parameters:

   - title
   - price
   - image
