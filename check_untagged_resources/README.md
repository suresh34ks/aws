# AWS SDK for Node.js Project to check Untagged Resources (EC2, S3, Network Interfaces)

Pretty Prints the resources (EC2, S3, Network Interfaces) which are missing tags, untagged & tagged with wrong values.

## Requirements

The only requirement of this application is the Node Package Manager. All other
dependencies (including the AWS SDK for Node.js) can be installed with:

    npm install

## Basic Configuration

You need to set up your AWS security credentials before the sample code is able
to connect to AWS. You can do this by creating a file named "credentials" at ~/.aws/ 
(C:\Users\USER_NAME\.aws\ for Windows users) and saving the following lines in the file:

    [default]
    aws_access_key_id = <your access key id>
    aws_secret_access_key = <your secret key>

See the [Security Credentials](http://aws.amazon.com/security-credentials) page.
It's also possible to configure your credentials via a configuration file or
directly in source. See the AWS SDK for Node.js [Developer Guide](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html)
for more information.

## Configuring Tag Values 
- Edit the file test.js 
 - Keep the regions which are required in aws_regions var or leave it as is.
```
var aws_regions = [
    'us-east-2',
    'us-east-1',
    'us-west-1',
    'us-west-2',
    'af-south-1',
    'ap-east-1',
    'ap-southeast-3',
    'ap-south-1',
    'ap-northeast-3',
    'ap-northeast-2',
    'ap-southeast-1',
    'ap-southeast-2',
    'ap-northeast-1',
    'ca-central-1',
    'eu-central-1',
    'eu-west-1',
    'eu-west-2',
    'eu-south-1',
    'eu-west-3',
    'eu-north-1',
    'me-south-1',
    'sa-east-1'
]; 
```
 - Edit the Tags & values for EC2 
```
var args = {
    "Tags": [{
        "Name": "tag1_Key",
        "AllowedValues": [
            "tag1_Value1",
            "tag1_Value2",
            "tag1_Value3"
        ]
    },
    {
        "Name": "tag2_Key",
        "AllowedValues": [
            "tag2_Value1",
            "tag2_Value2",
            "tag2_Value3",
            "tag2_Value4",
        ]
    },
    ]
}
```
 - Edit the Tags & Values for S3 Buckets
```
var s3_bucket_args = {
    "Tags": [{
        "Name": "tag1_Key",
        "AllowedValues": [
            "tag1_Value1",
            "tag1_Value2",
            "tag1_Value3"
        ]
    },
    {
        "Name": "tag2_Key",
        "AllowedValues": [
            "tag2_Value1",
            "tag2_Value2",
            "tag2_Value3",
            "tag2_Value4",
        ]
    },
    ]
}
```
 - Edit the Tags & Values for EBS Volumes
```
var volume_args = {
    "Tags": [{
        "Name": "tag1_Key",
        "AllowedValues": [
            "tag1_Value1",
            "tag1_Value2",
            "tag1_Value3"
        ]
    },
    {
        "Name": "tag2_Key",
        "AllowedValues": [
            "tag2_Value1",
            "tag2_Value2",
            "tag2_Value3",
            "tag2_Value4",
        ]
    },
    ]
}

``` 
 - Edit the Tags & Vlaues for Network Interfaces
```
var network_interface_args = {
    "Tags": [{
        "Name": "tag1_Key",
        "AllowedValues": [
            "tag1_Value1",
            "tag1_Value2",
            "tag1_Value3"
        ]
    },
    {
        "Name": "tag2_Key",
        "AllowedValues": [
            "tag2_Value1",
            "tag2_Value2",
            "tag2_Value3",
            "tag2_Value4",
        ]
    },
    ]
}
```
##  Running Script
```
node test.js
```

## License

This sample application is distributed under the
[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
