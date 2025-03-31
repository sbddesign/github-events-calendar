"use strict";
const core = require('@actions/core');
const ical = require("ical-generator");
const { Octokit } = require("@octokit/rest");
const MarkdownIt = require("markdown-it");
const parseDuration = require("parse-duration");
const YAML = require("yaml");

function keysToLowercase(obj) {
    let newObj = Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]));
    return newObj;
}

const cal = ical({
    domain: core.getInput('domain'),
    prodId: {
        company: core.getInput('company'),
        product: 'ical-generator'
    },
    name: core.getInput('name'),
    timezone: core.getInput('timezone')
});

const octokit = new Octokit({
    //auth: process.env.GITHUB_AUTH,
    useragent: "github-events-calendar v0.1.0"
});

const md = new MarkdownIt();
const Timezone = "GMT";

async function getIssues(owner, repo, label) {
    let request = "GET /repos/:owner/:repo/issues";
    let issues = await octokit.request(request, { 
        owner, 
        repo, 
        labels: label,
        state: 'all'  // This will include both open and closed issues
    });
    return issues;
}

function addEventFromIssue(issue) {
    let markdown = md.parse(issue.body, {});
    let meta = YAML.parse(markdown[0].content);
    meta = keysToLowercase(meta);

    // Check duration
    meta.durationMs = meta.duration
        ? parseDuration(meta.duration)
        : parseDuration(meta.time);

    // Default duration to one hour
    const duration = meta.durationMs ? meta.durationMs : 3600000;

    // Create an iCal entry if "utctime" is defined.
    if (meta.utctime) {
        const utcTime = meta.utctime;
        const startDate = new Date(utcTime);

        let endDate;
        if (duration) {
            endDate = new Date(startDate.getTime() + duration);
        }

        const eventObject = {
            start: startDate,
            end: endDate,
            summary: issue.title,
            description: 'Find out more at: ' + issue.html_url,
            htmlDescription: 'Find out more at: <a href="' + issue.html_url + '">' + issue.html_url + '</a>',
            url: issue.html_url,
            timestamp: startDate,
            uid: issue.id
        };

        try{
            cal.createEvent(eventObject)
            console.log('✅ Added "' + eventObject.summary + '" to calendar')
        } catch (e) {
            console.log('❌ Failed to add "' + eventObject.summary + '" to calendar')
            throw e;
        }
    }
}

const repository = core.getInput('repository').split(',');

getIssues(repository[0], repository[1], repository[2]).then((issues) => {
    issues.data.forEach(issue => addEventFromIssue(issue));

    cal.save(core.getInput('file'), () => {});
}).catch((err) => {
    console.error("error", err);
});
