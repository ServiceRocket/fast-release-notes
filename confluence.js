"use strict";

var fs   = require("fs");
var rest = require("restler");
var uuid = require("node-uuid");
var Promise = require("bluebird");


function ConfluencePublisher(url, username, password){

  this.url = url; 
  this.username = username;
  this.password = password;


  this.publish = function(space, title, content) {

    console.log('Destination: ' + this.url);
  
    return new Promise(function(f, j) {
  
      let data = { 
        type: "blogpost",
        space: {
          key: space
        },
        title: title,
        body: {
          storage: {
            value: content,
            representation: "storage"
          }
      }};

      console.log("Content: " + JSON.stringify(data));
  
      rest.postJson(this.url + "/rest/api/content", data, {
          username: this.username,
          password: this.password,
        }).on('complete', function(r, p) {
          if (r instanceof Error || p.statusCode >= 400) j(JSON.stringify(r)); else f(r);
        });
  
    }.bind(this));
  
  };
}

if (!process.env.SPACE || !process.env.FILE || !process.env.URL || !process.env.USERNAME || !process.env.PASSWORD) {
  throw new Error("One or more of these variables are missing: URL, USERNAME, PASSWORD, SPACE, FILE");
}


Promise.onPossiblyUnhandledRejection(function(e){ throw e; });

fs.readFile(process.env.FILE, "UTF-8", (e, r) => {

  if (e) throw e;

  console.log("Format: " + process.env.MARKDOWN == 1 ? "Markdown" : "Plain/HTML");
  console.log("File: " + process.env.FILE);

  var cp = new ConfluencePublisher(
    process.env.URL,
    process.env.USERNAME,
    process.env.PASSWORD
  )

  cp.publish(process.env.SPACE, process.env.TITLE ? process.env.TITLE : uuid.v1(), r).then(
    (r) =>  console.log("OK!")
  );


});

