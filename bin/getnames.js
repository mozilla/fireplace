#!/usr/bin/env node

/*
    Utility to iterate over a list of repos (given in the repos variable below)
    and use the GitHub API to extract a list of contributors. The API is then 
    used to find the contributor's name, if they have set that in their Github
    account. This script expects to find an environment variable GITHUB_OAUTH_TOKEN, 
    which allows up to 5000 requests per hour, rather than 60 per hour for
    anonymous requests.

    Some manual intervention on the received list may still be needed, for instance to
    remove the GitHub help account, or to provide additional formatting.
*/

var https = require('https');
var url = require('url');
var github_oauth_token = process.env.GITHUB_OAUTH_TOKEN;

if (!github_oauth_token) {
    console.log('You need to have an OAUTH token.');
    console.log('You can create one here: https://github.com/settings/applications');
    console.log('And add it to your environment as GITHUB_OAUTH_TOKEN');
    process.exit();
}

// Repos taken from https://wiki.mozilla.org/Marketplace/dev/repositories
var repos = ['zamboni', 'fireplace', 'webpay', 'solitude', 'monolith', 'monolith-aggregator', 
             'rocketfuel', 'app-validator', 'commbadge', 'marketplace-stats', 'legal-docs', 
             'zippy', 'monolith-client', 'ashes', 'marketplay', 'flue', 'solitude-security'];
var names = {};
var users = [];

var repoUrl = 'https://api.github.com/repos/mozilla/{{repo}}/contributors?';

// common functionality for both types of call
// Add headers, make the call, parse the resulting JSON, call the callback
function get(targeturl, success, error) {
    var options = url.parse(targeturl);
    options.headers = {
        'User-Agent': 'Fireplace-Contributors-Collector',
        'Authorization': 'token ' + github_oauth_token
    };
    var body = [];
    var receive = function receive(res) {
        res.setEncoding('utf-8');
        res.on('data', function receiveChunk(chunk) {
            body.push(chunk);
        });
        res.on('end', function endReceive() {
            try {
                var parsedData = JSON.parse(body.join(''));
            } catch(e) {
                console.log('Could not parse JSON: %s', body.join(''));
                return;
            }
            success(parsedData);
        });
    };
    var req = https.request(options, receive);
    req.end();
    req.on('error', error);
}

/* We store in a on object to enforce uniqueness, but want a list for printing */
function objToList(obj) {
    // First get a list of keys, convert to list of values
    var list = Object.keys(obj).map(function(key){
        return obj[key];
    });
    return list.sort();
}

/* Passing console.log to forEach doesn't work because of arity
   This is used so we can print one item per line 
   And also to format as HTML suitable to include in the page
*/
function printHTML(item) {
    /* item 0 is id normalized to lowercase for sorting, ignore) */
    var id = item[1];
    var url = item[2];
    var name = item[3]; // may or may not exist
    var htmlItem;
    if (name){
        htmlItem = '<li><a href="' + url + '">' + id + '</a> (' + name +  ')</li>';
    }else{
        htmlItem = '<li><a href="' + url + '">' + id + '</li>';
    }
    console.log(htmlItem);
}

/* Main function, iterates through repos and the users in each repo asynchronously */
function nextUser() {
    if (users.length) {
        var user = users.pop();
        get(user.url, receiveUser, userError);
    } else if (repos.length) {
        var repo = repos.pop();
        get(repoUrl.replace('{{repo}}', repo), receiveRepo, repoError);
    } else {
        objToList(names).forEach(printHTML);
    }
}

function receiveRepo(_users) {
    users = _users;
    nextUser();
}

function receiveUser(user) {
    if (!names[user.login] && user.login !== 'invalid-email-address'){
        names[user.login] = [user.login.toLowerCase(), user.login, user.html_url, user.name];
    }
    nextUser();
}

function repoError(err) {
    console.log('errors in repo: %o', err);
}

function userError(err) {
    console.log('errors in user: %o', err);
}

nextUser();
