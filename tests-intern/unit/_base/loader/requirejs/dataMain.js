require(
	{
        baseUrl: './'
    },
    [ 'simple' ],
    function (simple) {
		parent.loaderTestDfd.resolve([ simple ]);
    }
);
