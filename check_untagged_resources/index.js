var AWS = require("aws-sdk");

const moment = require('moment');
const momentTimezone = require('moment-timezone');
const _ = require('lodash');
const { result } = require("lodash");
// AWS.config.update({
//     region: 'us-east-1'
// });


exports.handler = async (event, args, volume_args, network_interface_args, s3_bucket_args, aws_region) => {
    const s3 = new AWS.S3({region: aws_region})
    const ec2 = new AWS.EC2({region: aws_region});
    // var curTime = moment(event.time).tz("Asia/Kolkata")
    // var curHour = curTime.hour();
    // var curDay = curTime.day();
    var dateTime = new Date();
    console.log("Date: ",dateTime);
    // console.log("Current Hour (IST) is " + curHour );
    // console.log("Week day is " + curDay+ "\n");

    var params = {
        // "Filters": [{
        //     "Name": "instance-id",
        //     "Values": [
        //         "i-0f4fab92784af44a0"
        //     ]
        // }]
    }

    var ec2PromiseFunction = () => {
        return new Promise(function (resolve, reject) {
            ec2.describeInstances(params, function (error, data) {
                console.log(
                    "----------------------------------------------------------------" +
                    " EC2 Instances " +
                    "----------------------------------------------------------------"
                );
                if (error) {
                    return reject(error);
                }
                if (_.hasIn(data, 'Reservations')) {
                    var instances_table = [];
                    data['Reservations'].forEach(function (reservation) {
                        if (reservation && reservation.Instances) {
                            reservation.Instances.forEach(function (i) {
                                var instances = [];
                                var instanceName;
                                var missingTags = "";
                                var instanceName = "";
                                var presentTags = new Set(); //------
                                var allowedTags = new Set(); //------
                                var misMatchedTags = new Set(); //----
                                var Mismatched = "";
                                var flag = 0;
                                var tags = i.Tags;
                                tags.forEach(function (tag) {
                                    presentTags.add(tag['Key']);
                                    args.Tags.forEach(function (arg) {
                                        allowedTags.add(arg['Name']); //-----
                                        if (tag['Key'] == "Name") {
                                            instanceName = tag['Value'];
                                        }
                                        if (tag['Key'] == arg['Name']) {
                                            presentTags.add(arg['Name']);
                                            if (!arg['AllowedValues'].includes(tag['Value'])) {
                                                misMatchedTags.add(tag['Key'] + " : " + tag['Value']);
                                                if (flag == 0) { flag = 1 };
                                            }
                                        }
                                    });
                                });
                                allowedTags.forEach(function (item) { //-----
                                    if (!presentTags.has(item)) { //-----
                                        missingTags = item.concat(" " + missingTags); //-----
                                        if (flag == 0) { flag = 1 };
                                    }
                                });
                                if (!misMatchedTags.size == 0) {
                                    misMatchedTags.forEach(function (item) {
                                        Mismatched = item.concat(Mismatched + " | ");
                                    });
                                } else {
                                    misMatchedTags = "";
                                }
                                if (flag == 1) {
                                    instances_table.push({ Instance_ID: i.InstanceId, Instance_Name: instanceName, Missing_Tags: missingTags, Mismatched_Tags: Mismatched });
                                    // console.log("Instance ID:\t\t" + i.InstanceId);
                                    // console.log("Instance Name:\t\t" + instanceName);
                                    // console.log("Missing Tags:\t\t" + missingTags);
                                    // console.log("Mismatched Tags:\t" + Mismatched);
                                    // console.log("\n");
                                }
                                resolve("DONE");
                            });
                        }
                    });
                    console.table(instances_table);
                }
            });
        });
    }

    var volumePromiseFunction = () => {
        return new Promise((resolve, reject) => {
            var params = {
                MaxResults: '1000'
            };
            ec2.describeVolumes(params, function (err, data) {
                var volumeInterfaces_table = [];
                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log(
                        "----------------------------------------------------------------" +
                        " EBS Volumes " +
                        "----------------------------------------------------------------"     
                    );
                    for (var i = 0; i < data.Volumes.length; i++) {
                        var missingTags = ""; //------
                        var presentTags = new Set(); //------
                        var allowedTags = new Set(); //------
                        var misMatchedTags = new Set();
                        var mismatched = '';
                        var flag = 0;
                        instance_id = data.Volumes[i].Attachments[0].InstanceId;
                        volume_id = data.Volumes[i].Attachments[0].VolumeId;
                        data.Volumes[i].Tags.forEach(function (tag) {
                            presentTags.add(tag['Key']); //-----
                            volume_args.Tags.forEach(function (arg) {
                                allowedTags.add(arg['Name']); //-----
                                if (tag['Key'] == arg['Name']) {
                                    presentTags.add(arg['Name']);
                                    if (!arg['AllowedValues'].includes(tag['Value'])) {
                                        misMatchedTags.add(tag['Key'] + " : " + tag['Value']); //-----
                                        if (flag == 0) { flag = 1 };
                                    }
                                }
                            });
                        });

                        allowedTags.forEach(function (item) {
                            if (!presentTags.has(item)) {
                                missingTags = item.concat(" " + missingTags);
                                if (flag == 0) { flag = 1 };
                            }
                        });
                        if (!misMatchedTags.size == 0) {
                            misMatchedTags.forEach(function (item) {
                                mismatched = item.concat(" | " + mismatched);
                            });
                        } else {
                            misMatchedTags = " ";
                        }
                        if (flag == 1) {
                            volumeInterfaces_table.push({ Instance_ID: instance_id, Volume_ID: volume_id, Missing_Tags: missingTags, Mismatched_Tags: mismatched });
                            // console.log("Instance ID:\t\t" + instance_id);
                            // console.log("Volume ID:\t\t" + volume_id);
                            // console.log("Missing Tags:\t\t" + missingTags);
                            // console.log("Mismatched Tags:\t" + mismatched);
                            // console.log("\n");
                        }
                        resolve("DONE");
                    } console.table(volumeInterfaces_table);
                }
            });
        });
    }

    var s3BucketsPromise = () => {
        return new Promise(function (resolve, reject) {
            s3.listBuckets(params, function (err, data) { // s3.getBucketTagging({"Bucket": 'kinara-production-file-storage' }, function(err, data) { console.log(data)});
                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log(
                        "----------------------------------------------------------------" +
                        "  S3 BUCKETS " +
                        "----------------------------------------------------------------"
                    );
                    bucketsList = data.Buckets;
                    var allBucketsPromise = [];
                    var s3Buckets_table = [];
                    var untagged = [];
                    bucketsList.forEach(function (i) {
                        var s3_bucketsList = {};
                        bucket = {
                            "Bucket": i['Name']
                        };

                        var apiPromise = new Promise(function (resolve, reject) {
                            s3.getBucketTagging(bucket, function (err, data) {
                                var missingTags = ""; //------
                                var presentTags = new Set(); //------
                                var allowedTags = new Set(); //------
                                var misMatchedTags = new Set(); //----
                                var mismatched = "";
                                var flag=0;
                                if (err) {
                                    //console.log(err, err.stack);  
                                    s3_bucket_args.Tags.forEach(function (arg) {
                                        missingTags = arg['Name']+" "+missingTags;
                                    });
                                    s3Buckets_table.push({ Bucket: i['Name'], Missing_Tags: missingTags, Mismatched_Tags: mismatched });
                                } else {
                                    
                                    s3_bucketsList.Name = i['Name'];
                                    s3_bucketsList.TagSet = data.TagSet;
                                    s3_bucketsList.TagSet.forEach(function (tag) {
                                        presentTags.add(tag['Key']);
                                        s3_bucket_args.Tags.forEach(function (arg) {
                                            allowedTags.add(arg['Name']); //-----
                                            if (tag['Key'] == arg['Name']) {
                                                presentTags.add(arg['Name']);
                                                if (!arg['AllowedValues'].includes(tag['Value'])) {
                                                    misMatchedTags.add(tag['Key'] + " : " + tag['Value']);
                                                    if (flag == 0){flag=1};
                                                }
                                            }
                                        });
                                    });
                                    allowedTags.forEach(function (item) { //-----
                                        if (!presentTags.has(item)) { //-----
                                            missingTags = item.concat(" " + missingTags); //-----
                                            if (flag == 0){flag=1};
                                        }
                                    });
                                    if (!misMatchedTags.size == 0) {
                                        misMatchedTags.forEach(function (item) {
                                            mismatched = item.concat(mismatched + " | ");
                                        });
                                    } else {
                                        misMatchedTags = "";
                                    }
                                    if (flag == 1){
                                        s3Buckets_table.push({ Bucket: s3_bucketsList.Name, Missing_Tags: missingTags, Mismatched_Tags: mismatched });
                                    }

                                }
                                resolve();
                            });
                        });
                        allBucketsPromise.push(apiPromise);
                    });
                    Promise.all(allBucketsPromise).then(function (data) {
                        resolve("DONE");
                        console.table(s3Buckets_table);
                    });
                }
            });
        });
    }
    
    // var s3BucketsPromise = () => {
    //     return new Promise(function (resolve, reject)  {
    //         var params = {
    //             // MaxResults: '1000'
    //         };
    //         s3.listBuckets(params, function (err, data) {
                
    //             if (err) {
    //                 console.log(err, err.stack);
    //             } else {
    //                 console.log(
    //                     "----------------------------------------------------------------" +
    //                     " S3 Buckets " +
    //                     "----------------------------------------------------------------"

    //                 );
    //                 var untagged = [];
    //                 var allBucketsPromise = [];
    //                 var s3Buckets_table = [];
    //                 for (var i = 0; i < data.Buckets.length; i++) { 
    //                     bucket_name = data.Buckets[i].Name;
    //                     creation_date = data.Buckets[i].CreationDate;
    //                     var bucket_param = {
    //                         Bucket: bucket_name
    //                     };
    //                     var apiPromise = new Promise(function (resolve, reject) {
                            
    //                         s3.getBucketTagging(bucket_param, function (err, bucket_tags) {
                                
    //                             if (err) {
    //                                 untagged.push(bucket_name);
    //                                 // console.log(err, err.stack); // an error occurred
    //                             }
    //                             else {
    //                             var missingTags = ""; //------
    //                             var presentTags = new Set(); //------
    //                             var allowedTags = new Set(); //------
    //                             var misMatchedTags = new Set();
    //                             var mismatched = '';
    //                             var flag = 0;
    //                                 // successful response
    //                                 bucket_tags.TagSet.forEach(function (tag) {
    //                                     presentTags.add(tag['Key']);
    //                                     s3_bucket_args.Tags.forEach(function (arg) {
    //                                         allowedTags.add(arg['Name']); //-----
    //                                         if (tag['Key'] == arg['Name']) {
    //                                             presentTags.add(arg['Name']);
    //                                             if (!arg['AllowedValues'].includes(tag['Value'])) {
    //                                                 misMatchedTags.add(tag['Key'] + " : " + tag['Value']); //-----
    //                                                 if (flag == 0) { flag = 1 };
    //                                             }
    //                                         }
    //                                     });
    //                                 });
    //                                 allowedTags.forEach(function (item) {
    //                                     if (!presentTags.has(item)) {
    //                                         missingTags = item.concat(" " + missingTags);
    //                                         if (flag == 0) { flag = 1 };
    //                                     }
    //                                 });
    //                                 if (!misMatchedTags.size == 0) {
    //                                     misMatchedTags.forEach(function (item) {
    //                                         mismatched = item.concat(" | " + mismatched);
    //                                     });
    //                                 } else {
    //                                     misMatchedTags = " ";
    //                                 }
    //                                 if (flag == 1) {
    //                                     console.log("Name:\t\t\t" + bucket_name);
    //                                     console.log("Missing Tags:\t\t" + missingTags);
    //                                     s3Buckets_table.push({ Bucket: bucket_name, Missing_Tags: missingTags, Mismatched_Tags: mismatched });
    //                                 }
    //                             }
    //                             resolve();
    //                         });
                            
    //                     });
    //                     allBucketsPromise.push(apiPromise);
    //                 }
    //                 Promise.all(allBucketsPromise).then(function (data) {
    //                     resolve("DONE");
    //                     console.table(s3Buckets_table);
    //                 });
                    
    //                 // untagged.forEach(function (bucket) {
    //                 //     console.log("WARNING: S3 Bucket -> ", bucket, 'has no Tags Associated !');
    //                 // });

    //             }
    //         });
    //     });
    // }

    var networkInterfacesPromiseFunction = () => {
        return new Promise((resolve, reject) => {
            var params = {
                MaxResults: '1000'
            };
            ec2.describeNetworkInterfaces(params, function (err, data) {
                var networkInterfaces_table = [];
                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log(
                        "----------------------------------------------------------------" +
                        " Network Interfaces " +
                        "----------------------------------------------------------------"

                    );
                    for (var i = 0; i < data.NetworkInterfaces.length; i++) {
                        var missingTags = ""; //------
                        var presentTags = new Set(); //------
                        var allowedTags = new Set(); //------
                        var misMatchedTags = new Set();
                        var mismatched = '';
                        var flag = 0;
                        var instance_id = data.NetworkInterfaces[i].Attachment.InstanceId;
                        var network_interface_id = data.NetworkInterfaces[i].NetworkInterfaceId;
                        data.NetworkInterfaces[i].TagSet.forEach(function (tag) {
                            presentTags.add(tag['Key']);
                            network_interface_args.Tags.forEach(function (arg) {
                                allowedTags.add(arg['Name']); //-----
                                if (tag['Key'] == arg['Name']) {
                                    presentTags.add(arg['Name']);
                                    if (!arg['AllowedValues'].includes(tag['Value'])) {
                                        misMatchedTags.add(tag['Key'] + " : " + tag['Value']); //-----
                                        if (flag == 0) { flag = 1 };
                                    }
                                }
                            });
                        });
                        allowedTags.forEach(function (item) {
                            if (!presentTags.has(item)) {
                                missingTags = item.concat(" " + missingTags);
                                if (flag == 0) { flag = 1 };
                            }
                        });
                        if (!misMatchedTags.size == 0) {
                            misMatchedTags.forEach(function (item) {
                                mismatched = item.concat(" | " + mismatched);
                            });
                        } else {
                            misMatchedTags = " ";
                        }
                        if (flag == 1) {
                            networkInterfaces_table.push({ Instance_ID: instance_id, Interface_ID: network_interface_id, Missing_Tags: missingTags, Mismatched_Tags: mismatched });
                        }
                        resolve("DONE");
                    } 
                    console.table(networkInterfaces_table);
                }
            });
        });
    };

    return ec2PromiseFunction()
        .then(() => {
            return s3BucketsPromise();
        })
        .then(() => {
            return volumePromiseFunction();
        })
        .then(() => {
            return networkInterfacesPromiseFunction();
        })

}
