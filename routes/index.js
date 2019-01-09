var express = require('express');
var router = express.Router();

var awskey = process.env.AWS_ACCESS_KEY_ID || '';
var awssecretkey = process.env.AWS_SECRET_ACCESS_KEY || '';
var awsregion = process.env.AWS_REGION || 'us-east-1';
var showBucket = process.env.S3_BUCKET;
var imgPath = process.env.IMG_PATH;
var pageTitle = process.env.PAGE_TITLE || 'AWS S3 Image Viewer'; 
var AWS = require('aws-sdk');
AWS.config.update({accessKeyId: awskey, secretAccessKey: awssecretkey, region: awsregion});
var s3 = new AWS.S3();

//var IMAGE_TYPEFILTER = process.env.IMAGE_TYPEFILTER || '.png,.jpg';

//----------------------------------------------------------------------------
// validate the images and filter them according to prefs
//----------------------------------------------------------------------------
function filterImages(data) {
    // TODO filter based on types configured (case insensitive)
    return data;
}

//----------------------------------------------------------------------------
// loop through S3 formatted API results and build an images list
//----------------------------------------------------------------------------
function buildImagesListFromS3Data(params, images, cb) {
    const S3_PREFIX = 'https://s3.amazonaws.com/' + showBucket + '/';
    if (!images) {
        images = [];
    }
    if (!params) {
        params = {
          Bucket: showBucket,
          //ContinuationToken: 'STRING_VALUE',
          //Delimiter: 'STRING_VALUE',
          //EncodingType: url,
          //FetchOwner: false,
          //MaxKeys: 50,
          Prefix: imgPath,
          //RequestPayer: requester,
          //StartAfter: imgPath
        };
    }
    s3.listObjectsV2(params, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        return images;
      } else {
        //console.log(data);
        var contents = data.Contents
        //console.log("iterating " + JSON.stringify(contents));
        for (var iter in contents) {
            // any validation of key can go here
            console.log("adding " + S3_PREFIX + contents[iter].Key)
            images.push(S3_PREFIX + contents[iter].Key);
        }
        if (data.isTruncated) {
           params.Marker = contents[contents.length-1].Key; 
           images = buildImagesListFromS3Data(params, images, cb);
        }
        else {
            console.log(images);
            cb(images);
        }
      }
    });
}

//----------------------------------------------------------------------------
// GET on the main page.
//----------------------------------------------------------------------------
router.get('/', function(req, res, next) {

  var imagesArray = [];
  if (!showBucket) { 
    console.log('no bucket, forcing to first bucket');
  }
  console.log('loading bucket: ' + showBucket);

  buildImagesListFromS3Data(null, null, function(result) {
    filteredImagesArray = filterImages(result);
    res.render('index', { title: pageTitle, showBucket: showBucket, images: JSON.stringify(filteredImagesArray)});
  });
});

module.exports = router;
