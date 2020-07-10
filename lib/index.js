const rule = require("unified-lint-rule");
const visit = require("unist-util-visit");
const checkLinks = require("check-links");
const isOnline = require("is-online");

function ensureNoDeadUrls(ast, file, options) {
	const urlToNodes = {};

	visit(ast, ["link", "image", "definition"], (node) => {
		const url = node.url;
		if (!url) return;
		if (
			options.skipLocalhost &&
			/^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?/.test(url)
		)
			return;

		if (!urlToNodes[url]) {
			urlToNodes[url] = [];
		}

		urlToNodes[url].push(node);
	});

	return checkLinks(Object.keys(urlToNodes), options.gotOptions).then(
		(results) => {
			Object.keys(results).forEach((url) => {
				const result = results[url];
				if (result.status !== "dead") return;

				const nodes = urlToNodes[url];
				if (!nodes) return;

				for (const node of nodes) {
					file.message(`Link to ${url} is dead`, node);
				}
			});
		}
	);
}

module.exports = rule("remark-lint:no-dead-url", (ast, file, options = {}) => {
	return isOnline()
		.then((online) => {
			if (online) {
				ensureNoDeadUrls(ast, file, options);
			} else {
				if (!options.skipOffline) {
					file.message(
						"You are not online and have not set skipOffline: true."
					);
				}
			}
		})
		.catch((err) => {
			console.error(err);
		});
});
