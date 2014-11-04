define([
	'./intern',
	'intern'
], function (config, intern) {
	var args = intern.args;

	config.tunnel = args.tunnel || 'NullTunnel';

	config.tunnelOptions = {
		hostname: args.tunnelHost || 'localhost',
		port: Number(args.tunnelPort) || 4444
	};

	var proxyHost = args.proxyHost || 'localhost';
	config.proxyPort = Number(args.proxyPort) || 9001;
	config.proxyUrl = 'http://' + proxyHost + ':' + config.proxyPort + '/';

	switch (args.env) {
		case 'ff':
			config.environments = [ { browserName: 'firefox' } ];
			break;
		case 'chrome':
			config.environments = [ { browserName: 'chrome', chromeOptions: { args: [ '--test-type' ] } } ];
			break;
		case 'safari':
			config.environments = [ { browserName: 'safari' } ];
			break;
		case 'ie':
			config.environments = [ { browserName: 'internet explorer' } ];
			break;
		default:
			config.environments = [
				{ browserName: 'firefox' },
				{ browserName: 'chrome', chromeOptions: { args: [ '--test-type' ] } }
			];
	}

	return config;
});
