const ical = require("ical-generator");
const cal = ical();
const { Octokit } = require("@octokit/rest");
const MarkdownIt = require("markdown-it");
const parseDuration = require("parse-duration");
const YAML = require("yaml");
const { keysToLowercase } = require("./helpers");
const octokit = new Octokit({
	//auth: process.env.GITHUB_AUTH,
	useragent: "github-events-calendar v0.1.0"
});

const md = new MarkdownIt();

const Timezone = "GMT";
const repositories = [
	{ org: "BitcoinDesign", repo: "Meta", label: "call" },
	{ org: "BitcoinDesign", repo: "Guide", label: "call" }
];

async function getIssues(owner: string, repo: string, label: string) {
	let request = "GET /repos/:owner/:repo/issues";
	let issues = await octokit.request(request, { owner, repo, labels: label });
	return issues;
}

function getEventObjFromIssue(issue: any) {
	let markdown = md.parse(issue.body, {});
	let meta = YAML.parse(markdown[0].content);
	meta = keysToLowercase(meta);
	// check duration
	meta.durationMs = meta.duration
		? parseDuration(meta.duration)
		: parseDuration(meta.time);

	let event = {
		title: issue.title,
		url: issue.url,
		date: meta.date,
		startTime: meta.time,
		duration: meta.durationMs
	};

	return event;
}

getIssues("BitcoinDesign", "Meta", "call")
	.then((issues) => {
		let events = issues.data.map((issue: any) => getEventObjFromIssue(issue));
		console.log(events);
	})
	.catch((err) => {
		console.error("error", err);
	});
