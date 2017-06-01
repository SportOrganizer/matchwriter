function makeAjax(url, windows, callback) {
	console.log(url);
	http.get(url, (res) => {
	  
		const statusCode = res.statusCode;
		const contentType = res.headers['content-type'];

		let error;

		if (statusCode !== 200) {
			error = new Error(`Request Failed.\n` + `Status Code: ${statusCode}`);
		} else if (!/^application\/json/.test(contentType)) {
			error = new Error(`Invalid content-type.\n` + `Expected application/json but received ${contentType}`);
		}

		if (error) {
			sendError("Nastala neočakávaná chyba (" + error.message + ")");
			res.resume();
			return;
		}
		
		let rawData = '';
		
		res.setEncoding('utf8');
		res.on('data', (chunk) => rawData += chunk);
		res.on('end', () => {
			try {
				let parsedData = JSON.parse(rawData);
				data = parsedData;
				return callback(data);
			} catch (e) {
				console.log(e.message);
			}
		});
	}).on('error', (e) => {
		console.log("Error2: " +  `Got error: ${e.message}`);
		sendError("Nastala neočakávaná chyba (" + e.message + ")");
	});
}