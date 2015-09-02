"use strict";

const fs      = require("fs");
const md      = require("markdown").markdown;
const tt      = require("textile-js");
const rest    = require("restler");
const uuid    = require("node-uuid");
const Promise = require("bluebird");

const GetSatPublisher = function(domain, username, password) {

  const URL = "https://api.getsatisfaction.com/topics.json";

  this.domain = domain;
  this.username = username;
  this.password = password;


  this.publish = function(product, subject, content) {

    console.log('Destination: ' + URL);
  
    return new Promise(function(f, j) {
  
      let data = { topic: { 
        company_domain: this.domain,
        style: "update",
        products: [product],
        subject: subject,
        content: content,
      }};
      let options = {
        username: this.username,
        password: this.password,
      };
     
      console.log("Content: " + JSON.stringify(data));
  
      rest.postJson(URL, data, options).on("complete", function(r, p) {
          //console.log(p);
          if (r instanceof Error || p.statusCode >= 400) j(JSON.stringify(r)); else f(r);
        });
  
    }.bind(this));
  
  };
}

Promise.onPossiblyUnhandledRejection(function(e){ throw e; });

if (!process.env.PRODUCT || !process.env.DOMAIN || !process.env.USERNAME || !process.env.PASSWORD) {
  throw new Error("One or more of these variables are missing: DOMAIN, USERNAME, PASSWORD, PRODUCT");
}
if (!process.env.FILE && !process.env.CONTENT) {
  throw new Error("Content must be assigned to one of these variables: CONTENT, FILE");
}

var content = process.env.CONTENT;
if (!content) {
  content = fs.readFileSync(process.env.FILE, { encoding: 'UTF-8', flag: 'r' });
}
var format = process.env.MARKUP;
if (format == "markdown") {
  content = md.toHTML(content);
} else if (format == "textile") {
  content = tt(content);
} else if (format != "html") {
  throw new Error("Markup must be one of the following: html (default), markdown or textile");
}

console.log("Format: " + format);
console.log("File: " + process.env.FILE);
console.log("Content: " + content);

new GetSatPublisher(
  process.env.DOMAIN,
  process.env.USERNAME,
  process.env.PASSWORD
).publish(process.env.PRODUCT, process.env.TITLE ? process.env.TITLE : uuid.v1(), content).then((r) => console.log("OK!"));
