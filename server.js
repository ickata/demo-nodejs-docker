const fs       = require( 'fs' );
const restapi  = require( 'restify' );
const mysql    = require( 'mysql' );
const imagelib = require( 'sharp' );

const server   = restapi.createServer();
const db       = mysql.createConnection({
   "host"      : "mariadb",
   "user"      : "root",
   "password"  : "root",
   "database"  : "nodejs-docker",
});

// Enable PUT/POST body parser
server.use( restapi.bodyParser({ mapParams: false }) );

// API endpoints for listing all products
server.get( 'products', ( req, res, next ) => {
   db.query( `SELECT * FROM products`, ( err, records ) => {
      if ( err ) {
         return next(
            new restapi.errors.ConflictError(
               `Error getting products: ${err}`
            )
         );
      }
      res.send( records.map( record => {
         record.image = 'files/' + record.image;
         return record;
      }) );
   });
});

// API endpoints for adding new product
server.post( 'products', ( req, res, next ) => {
   if ( ! req.files.image || ! req.files.image.name ) {
      return next(
         new restapi.errors.ConflictError(
            `Error adding product: missing image`
         )
      );
   }
   
   // Resize, copy & rename the image
   // Generate unique filename
   let newname = ( Date.now() + Math.random() ).toString( 16 ) + req.files.image.name;
   // Resize the image and save it
   imagelib( req.files.image.path ).resize( 50 ).withoutEnlargement().toFile(
      __dirname + '/files/' + newname,
      function () {
         // Remove source image
         fs.unlinkSync( req.files.image.path );
         // Save record to DB
         req.body.image = newname;
         db.query( `INSERT INTO products SET ?`, req.body, ( err, records ) => {
            if ( err ) {
               return next(
                  new restapi.errors.ConflictError(
                     `Error adding product: ${err}`
                  )
               );
            }
            res.send( 204 );
         });
      }
   );
});

// Static endpoint - files
server.get( /^\/files\/.*$/, restapi.serveStatic({
   directory   : __dirname,
}) );

// Static endpoint - web app
server.get( /^\/?^((?!files).)*$/, restapi.serveStatic({
   directory   : './web',
   default     : 'index.html',
}) );

server.listen( 3000, () => {
   console.log(
      `

----------------------------------
Listening at http://localhost:3000
----------------------------------

      `
   );
});
