const ical = require("ical-generator");
const { Octokit } = require("@octokit/rest");
const MarkdownIt = require("markdown-it");
const parseDuration = require("parse-duration");
const YAML = require("yaml");
const { keysToLowercase } = require("./helpers");

const cal = ical();
const octokit = new Octokit({
	//auth: process.env.GITHUB_AUTH,
	useragent: "github-events-calendar v0.1.0"
});

const md = new MarkdownIt();

const Timezone = "GMT";
const repositories = [
	{ org: "BitcoinDesign", repo: "Meta", label: "call" },
	{ org: "BitcoinDesign", repo: "Guide", label: "call" },
	{ org: "johnsBeharry", repo: "github-events-calendar", label: "call" },
];

async function getIssues(owner: string, repo: string, label: string): Promise<any> {
	let request = "GET /repos/:owner/:repo/issues";
	let issues = await octokit.request(request, { owner, repo, labels: label });
	return issues;
}

interface IEvent {
	title: string;
	url: string;
	date: string;
	startTime: string; // unix timestamp?
	duration: number;
}

function getEventObjFromIssue(issue: any): IEvent {
	let markdown = md.parse(issue.body, {});
	let meta = YAML.parse(markdown[0].content);
	meta = keysToLowercase(meta);
	// check duration
	meta.durationMs = meta.duration
		? parseDuration(meta.duration)
		: parseDuration(meta.time);

	let event: IEvent = {
		title: issue.title,
		url: issue.url,
		date: meta.date,
		startTime: meta.time,
		duration: meta.durationMs ? meta.durationMs : 3600000,
	};

	return event;
}


getIssues("BitcoinDesign", "Meta", "call")
	.then((issues: any) => {
		let events = issues.data.map((issue: any) => getEventObjFromIssue(issue));
		console.log(events);
	})
	.catch((err: any) => {
		console.error("error", err);
	});

