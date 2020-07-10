const http = require("http");

/**
 * @returns Promise<boolean>
 */
module.exports = function isOnline() {
	return new Promise((resolve, reject) => {
		http
			.request(
				{
					method: "HEAD",
					host: "google.com",
				},
				(res) => {
					resolve(true);
				}
			)
			.on("error", (err) => {
				if (err.code === "ENOTFOUND") {
					return resolve(false);
				}

				resolve(false);
				// reject(new Error(err));
			})
			.end();
	});
};
