import express, {  Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import { requireAuth } from './auth.router';
let cors = require('cors');

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());
  app.use(cors());
  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

    // Check if provided string is a valid URL
    const isValidURL = (url: string): Boolean => {
      try {
        new URL(url);
        return true;
      } catch (err) {
        return false;
      }
    };

    const imageFilter = async ( req: Request, res: Response, next: NextFunction) => {
      const { image_url } = req.query;
      // Check if image_url query parameter is present
      if(!image_url) {
        return res.status(422).send(`image_url query parameter is required - /filteredimage?image_url={{URL}}`);
      }
      // Check whether the image_url provided is valid
      if(!isValidURL(image_url)) {
        return res.status(422).send(`Invalid Image URL provided - ${image_url}`);
      }

      let filePath: string;
      try {
        // call filterImageFromURL(image_url) to filter the image
        filePath = await filterImageFromURL(image_url);
      } catch (error) {
        return res.status(500).send(`Error processing the request. Please check the image_url.`);
      }
      // Transfers the file at the given path
      return res.status(200).sendFile(filePath, (err: any) => {
        if(err) { next(err); }
        else {
          try {
            // delete the file on the server on successful response
            deleteLocalFiles([filePath]);
          } catch (error) {
            console.error(error.stack);
            console.error(`Error deleting file - ${filePath}`);
          }
        }
      });
    };

    // Route without Authentication - Ionic ion-img tag serving the image URL has a bug in binding sanitized value. If authentication is enabled for filtered image, jwt token need to be passed. But the filtered image url is directly used in the image tag. Hence using no Auth for udagram website example. \cloud-developer\course-02\exercises\udacity-c2-frontend\src\app\feed\feed-item\feed-item.component.html
    // https://github.com/ionic-team/ionic/issues/19091
    app.get( "/filteredimageNoAuth",
    async ( req: Request, res: Response, next: NextFunction ) => {
      return imageFilter(req, res, next);
    });

    // Route with Authentication
    app.get( "/filteredimage",
    requireAuth,
    async ( req: Request, res: Response, next: NextFunction ) => {
      return imageFilter(req, res, next);
    });
  
  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();