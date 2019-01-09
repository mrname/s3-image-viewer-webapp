# S3 Image Viewer App
It's a pretty basic webapp that formats and showcases a list of images from an AWS S3 bucket.

Here's a screenshot:
![Screenshot](./.screens/2017-10-31.png)

## About the code
It's node.js it talks to S3 and it uses [patternfly](http://www.patternfly.org/) for the UI.

## Configuration

The following environment variables need to be set:

* `S3_BUCKET_NAME` - Name of S3 bucket (like "my-bucket")
* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`

Optional configuration:

* `IMG_PATH` - Path inside of bucket to image directory
* `AWS_REGION` - Defaults to "us-east-1"
* `PAGE_TITLE` - Title at the top of the page, defaults to "AWS S3 Image Viewer"

## How to use this service

### Locally

1. ```npm install```
2. ```npm start```

### In Docker

```docker run -p 3000:3000 madscientist/s3-image-viewer-webapp```

### On OpenShift
```oc new-app https://github.com/dudash/s3-image-viewer-webapp.git```

You will need to a few environment variables to point your service to your AWS S3 source and configure preferences.
* Bucket Names - TBD
* Image Extension Filtering - TBD
* Credentials for accessing private buckets - TBD

## Want to help out?
Follow the guidelines in the [CONTRIBUTING](./CONTRIBUTING.md) doc
