const indexApp = require("./index.js");
const prompt = require('prompt');
const properties = [
    {
        name: 'aws_region',
        warning: 'Enter AWS Region code:',
        require: true
    }
];

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



var args = {
    "Tags": [{
        "Name": "BillableParty",
        "AllowedValues": [
            "kinara",
            "sarvagram",
            "fusion",
            "maitreya",
            "arohan",
            "internal",
            "loan2grow",
            "subk",
            "kgfs",
            "sambandh",
            "finwego",
            "safl",
            "northernarc",
            "witfin",
            "intellecash",
            "proinvest",
            "pahal",
            "irep",
            "demo",
            "gtp",
            "vara",
            "nafa",
            "ubfc",
            "finreach",
            "samasta",
            "dvaramoney",
            "naclretail",
            "dvaraeregistry",
            "spicemoney",
            "demo"

        ]
    },
    {
        "Name": "ServerCategory",
        "AllowedValues": [
            "Internal-Live",
            "Client-Production",
            "Client-SIT",
            "Client-UAT",
            "internal-Live",
            "Internal-Testing",
            "Internal-Development",
            "Client-DR",
            "Production"
        ]
    },
    ]
}
var volume_args = {
    "Tags": [{
        "Name": "BillableParty",
        "AllowedValues": [
            "kinara",
            "sarvagram",
            "fusion",
            "maitreya",
            "arohan",
            "internal",
            "loan2grow",
            "subk",
            "kgfs",
            "sambandh",
            "finwego",
            "safl",
            "northernarc",
            "witfin",
            "intellecash",
            "proinvest",
            "pahal",
            "irep",
            "demo",
            "gtp",
            "vara",
            "nafa",
            "ubfc",
            "finreach",
            "samasta",
            "dvaramoney",
            "naclretail",
            "dvaraeregistry",
            "spicemoney",
            "demo"
        ]
    },
    {
        "Name": "ServerCategory",
        "AllowedValues": [
            "Internal-Live",
            "Client-Production", ,
            "Client-SIT",
            "Client-UAT",
            "internal-Live",
            "Internal-Testing",
            "Internal-Development",
            "Client-DR"
        ]
    },
    {
        "Name": "VolumeType",
        "AllowedValues": [
            "PerdixApp",
            "PerdixDatabase",
            "PerdixAppData",
            "Root",
            "TempAttachment",
            "PerdixAppAndDatabase",
            "InternalAppData"

        ]
    }
    ]
}
var network_interface_args = {
    "Tags": [{
        "Name": "BillableParty",
        "AllowedValues": [
            "kinara",
            "sarvagram",
            "fusion",
            "maitreya",
            "arohan",
            "internal",
            "loan2grow",
            "subk",
            "kgfs",
            "sambandh",
            "finwego",
            "safl",
            "northernarc",
            "witfin",
            "intellecash",
            "proinvest",
            "pahal",
            "irep",
            "demo",
            "gtp",
            "vara",
            "nafa",
            "ubfc",
            "finreach",
            "samasta",
            "dvaramoney",
            "naclretail",
            "dvaraeregistry",
            "spicemoney",
            "demo"
        ]
    },
    {
        "Name": "ServerCategory",
        "AllowedValues": [
            "Internal-Live",
            "Client-Production", ,
            "Client-SIT",
            "Client-UAT",
            "internal-Live",
            "Internal-Testing",
            "Internal-Development",
            "Client-DR"
        ]
    }
    ]
}
var s3_bucket_args = {
    "Tags": [{
        "Name": "BillableParty",
        "AllowedValues": [
            "kinara",
            "sarvagram",
            "fusion",
            "maitreya",
            "arohan",
            "internal",
            "loan2grow",
            "subk",
            "kgfs",
            "sambandh",
            "finwego",
            "safl",
            "northernarc",
            "witfin",
            "intellecash",
            "proinvest",
            "pahal",
            "irep",
            "demo",
            "gtp",
            "vara",
            "nafa",
            "ubfc",
            "finreach",
            "samasta",
            "dvaramoney",
            "naclretail",
            "dvaraeregistry",
            "spicemoney",
            "demo"
        ]
    },
    {
        "Name": "ServerCategory",
        "AllowedValues": [
            "Internal-Live",
            "Client-Production", ,
            "Client-SIT",
            "Client-UAT",
            "internal-Live",
            "Internal-Testing",
            "Internal-Development",
            "Client-DR"
        ]
    }
    ]
}
process.env.AWS_SDK_LOAD_CONFIG = 1;
prompt.start();
var aws_region = '';
prompt.get(properties, function (err, result) {
    if (err) {
        return onErr(err);
    }
    if ( aws_regions.includes(result.aws_region)) {
        aws_region = result.aws_region;
        console.log('  AWS Region: ' + result.aws_region);
    } else {
        aws_region = 'us-east-1';
        console.log('  AWS Region: ' + 'us-east-1');
    }
    var event = {
        "id": "cdc73f9d-aea9-11e3-9d5a-835b769c0d9c",
        "detail-type": "Scheduled Event",
        "source": "aws.events",
        "account": "{{{account-id}}}",
        "time": "2020-03-30T11:18:00Z",
        "region": result.aws_region,
        "resources": [
            "arn:aws:events:us-east-1:123456789012:rule/ExampleRule"
        ],
        "detail": {}
    };

    indexApp.handler(event, args, volume_args, network_interface_args, s3_bucket_args, aws_region);

});
function onErr(err) {
    console.log(err);
    return 1;
}

