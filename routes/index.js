var express = require('express');
var router = express.Router();

var awskey = process.env.AWS_ACCESS_KEY_ID || '';
var awssecretkey = process.env.AWS_SECRET_ACCESS_KEY || '';
var awsregion = process.env.AWS_REGION || 'us-east-1';
var showBucket = process.env.S3_BUCKET;
var imgPath = process.env.IMG_PATH;
var pageTitle = process.env.PAGE_TITLE || 'AWS S3 Image Viewer'; 
const pageSize = process.env.PAGE_SIZE || 2;

const s3 = require('s3-cached')({
  bucket: showBucket,
  s3Options: {
    accessKeyId: awskey,
    secretAccessKey: awssecretkey
  }
});

const S3_PREFIX = 'https://s3.amazonaws.com/' + showBucket + '/';

//var IMAGE_TYPEFILTER = process.env.IMAGE_TYPEFILTER || '.png,.jpg';

//----------------------------------------------------------------------------
// validate the images and filter them according to prefs
//----------------------------------------------------------------------------
function filterImages(data) {
    // TODO filter based on types configured (case insensitive)
    // Since we have the full objects here, we now need to return an array of
    // just the actual URLs
    images = [];
    for (var iter in data) {
        // any validation of key can go here
        data[iter].fullUrl = S3_PREFIX + data[iter].Key;
        console.log(data[iter]);
        console.log("adding " + S3_PREFIX + data[iter].Key)
        images.push(data[iter]);
    }
    return images;
}

//----------------------------------------------------------------------------
// loop through S3 formatted API results and build an images list
//----------------------------------------------------------------------------
function buildImagesListFromS3Data(params, images, cb) {
    if (!images) {
        images = [];
    }
    var page = params.page || 1;
    if (page == 1) {
        var startImg = 0;
        var endImg = pageSize;
    } else {
        var startImg = page * pageSize;
        var endImg = startImg + pageSize;
    }
    
    s3.getKeysCached(imgPath).then((data) => {
        var images = [];

        for (var iter in data) {
            images.push(data[iter]);
        }

        if (params['start']) {
            console.log('Removing images created before ' + params['start']);
            var images = images.filter(image => new Date(params['start']) <= new Date(image.LastModified));
            console.log(images);
        };
        if (params['end']) {
            console.log('Removing images created after ' + params['end']);
            var images = images.filter(image => new Date(params['end']) >= new Date(image.LastModified));
            console.log(images);
        };

        images.sort(function(a,b){
          return new Date(b.LastModified) - new Date(a.LastModified);
        });

        var numPages = Math.ceil(images.length / pageSize);
        console.log(numPages);

        // Paginate
        var paginatedImages = images.slice(startImg, endImg);

        cb(paginatedImages, numPages);
    }).catch((err) => {
        console.log(err, err.stack); // an error occurred
    });
}

//----------------------------------------------------------------------------
// GET on the main page.
//----------------------------------------------------------------------------
router.get('/', function(req, res, next) {

  var start = req.query.start_date;
  var end = req.query.end_date;
  var page = req.query.page;
  var params = {
      start: start,
      end: end,
      page: page
  }
  var imagesArray = [];
  if (!showBucket) { 
    console.log('no bucket, forcing to first bucket');
  }
  console.log('loading bucket: ' + showBucket);

  buildImagesListFromS3Data(params, null, function(result, numPages) {
    filteredImagesArray = filterImages(result);
    res.render('index', { title: pageTitle, showBucket: showBucket, images: JSON.stringify(filteredImagesArray), numPages: numPages });
  });
});

module.exports = router;
