define([
	'require',
	'dojo/main'
], function (require, dojo) {
	return function (name) {
		var data = null;
		if(name === "reference_integrity"){
			if(dojo.isBrowser){
				data = {url: require.toUrl("./reference_integrity.json")};
			}else{
				data =
					{ data: {
						"identifier": "id",
						"label": "name",
						"items": [
							{"id": 1, "name": "Item 1"},
							{"id": 2, "name": "Item 2"},
							{"id": 3, "name": "Item 3"},
							{"id": 4, "name": "Item 4"},
							{"id": 5, "name": "Item 5"},
							{"id": 6, "name": "Item 6"},
							{"id": 7, "name": "Item 7"},
							{"id": 8, "name": "Item 8"},
							{"id": 9, "name": "Item 9"},
							{"id": 10, "name": "Item 10", "friends": [{"_reference": 1},{"_reference": 3},{"_reference": 5}]},
							{"id": 11, "name": "Item 11", "friends": [{"_reference": 10}], "siblings": [{"_reference": 10}]},
							{"id": 12, "name": "Item 12", "friends": [{"_reference": 3},{"_reference": 7}], "enemies": [{"_reference": 10}]},
							{"id": 13, "name": "Item 13", "friends": [{"_reference": 10}]},
							{"id": 14, "name": "Item 14", "friends": [{"_reference": 11}]},
							{"id": 15, "name": "item 15", "friends": [{"id": 16, "name": "Item 16"}]}
						]
					}
				};
			}
		}else if(name === 'countries'){
			if(dojo.isBrowser){
				data = {url: require.toUrl('./countries.json')};
			}else{
				data = {data: {
					identifier:'abbr',
					label:'name',
					items:[
						{abbr:'ec', name:'Ecuador', capital:'Quito'},
						{abbr:'eg', name:'Egypt', capital:'Cairo'},
						{abbr:'sv', name:'El Salvador', capital:'San Salvador'},
						{abbr:'gq', name:'Equatorial Guinea', capital:'Malabo'},
						{abbr:'er', name:'Eritrea', capital:'Asmara'},
						{abbr:'ee', name:'Estonia', capital:'Tallinn'},
						{abbr:'et', name:'Ethiopia', capital:'Addis Ababa'}
					]
				} };
			}
		}else if(name === 'countries_withNull'){
			if(dojo.isBrowser){
				data = {url: require.toUrl('./countries_withNull.json')};
			}else{
				data = {data: {
					identifier:'abbr',
					items:[
						{abbr:'ec', name:null, capital:'Quito'},
						{abbr:'eg', name:null, capital:'Cairo'},
						{abbr:'sv', name:'El Salvador', capital:'San Salvador'},
						{abbr:'gq', name:'Equatorial Guinea', capital:'Malabo'},
						{abbr:'er', name:'Eritrea', capital:'Asmara'},
						{abbr:'ee', name:null, capital:'Tallinn'},
						{abbr:'et', name:'Ethiopia', capital:'Addis Ababa'}
					]
				} };
			}
		}else if(name === 'countries_withoutid'){
			if(dojo.isBrowser){
				data = {url: require.toUrl('./countries_withoutid.json')};
			}else{
				data = {data: {
					label: 'name',
					items:[
						{abbr:'ec', name:null, capital:'Quito'},
						{abbr:'eg', name:null, capital:'Cairo'},
						{abbr:'sv', name:'El Salvador', capital:'San Salvador'},
						{abbr:'gq', name:'Equatorial Guinea', capital:'Malabo'},
						{abbr:'er', name:'Eritrea', capital:'Asmara'},
						{abbr:'ee', name:null, capital:'Tallinn'},
						{abbr:'et', name:'Ethiopia', capital:'Addis Ababa'}
					]
				} };
			}
		}else if (name === 'countries_withBoolean'){
			if(dojo.isBrowser){
				data = {url: require.toUrl('./countries_withBoolean.json')};
			}else{
				data = {data: {
					identifier:'abbr',
					items:[
						{abbr:'ec', name:'Ecuador', capital:'Quito', real:true},
						{abbr:'eg', name:'Egypt', capital:'Cairo', real:true},
						{abbr:'sv', name:'El Salvador', capital:'San Salvador', real:true},
						{abbr:'gq', name:'Equatorial Guinea', capital:'Malabo', real:true},
						{abbr:'er', name:'Eritrea', capital:'Asmara', real:true},
						{abbr:'ee', name:'Estonia', capital:'Tallinn', real:true},
						{abbr:'et', name:'Ethiopia', capital:'Addis Ababa', real:true},
						{abbr:'ut', name:'Utopia', capital:'Paradise', real:false}
					]
				} };
			}
		}else if (name === 'countries_withDates'){
			if(dojo.isBrowser){
				data = {url: require.toUrl('./countries_withDates.json')};
			}else{
				data = {data: {
					identifier:'abbr',
					items:[
						{abbr:'ec', name:'Ecuador', capital:'Quito'},
						{abbr:'eg', name:'Egypt', capital:'Cairo'},
						{abbr:'sv', name:'El Salvador', capital:'San Salvador'},
						{abbr:'gq', name:'Equatorial Guinea', capital:'Malabo'},
						{abbr:'er', name:'Eritrea', capital:'Asmara', independence:{_type:'Date', _value:'1993-05-24T00:00:00Z'}}, // May 24, 1993,
						{abbr:'ee', name:'Estonia', capital:'Tallinn', independence:{_type:'Date', _value:'1991-08-20T00:00:00Z'}}, // August 20, 1991
						{abbr:'et', name:'Ethiopia', capital:'Addis Ababa'}
					]
				} };
			}
		}else if (name === 'geography_hierarchy_small'){
			if(dojo.isBrowser){
				data = {url: require.toUrl('./geography_hierarchy_small.json')};
			}else{
				data = {data: {
					items:[
						{ name:'Africa', countries:[
							{ name:'Egypt', capital:'Cairo' },
							{ name:'Kenya', capital:'Nairobi' },
							{ name:'Sudan', capital:'Khartoum' }]},
						{ name:'Australia', capital:'Canberra' },
						{ name:'North America', countries:[
							{ name:'Canada', population:'33 million', cities:[
								{ name:'Toronto', population:'2.5 million' },
								{ name:'Alberta', population:'1 million' }
								]},
							{ name: 'United States of America', capital: 'Washington DC', states:[
								{ name: 'Missouri'},
								{ name: 'Arkansas'}
								]}
							]}
					]
				}};
			}
		}else if (name === 'data_multitype'){
			if(dojo.isBrowser){
				data = {url: require.toUrl('./data_multitype.json')};
			}else{
				data = {data: {
								'identifier': 'count',
								'label': 'count',
								items: [
									{ count: 1,    value: 'true' },
									{ count: 2,    value: true   },
									{ count: 3,    value: 'false'},
									{ count: 4,    value: false  },
									{ count: 5,    value: true   },
									{ count: 6,    value: true   },
									{ count: 7,    value: 'true' },
									{ count: 8,    value: 'true' },
									{ count: 9,    value: 'false'},
									{ count: 10,   value: false  },
									{ count: 11,   value: [false, false]},
									{ count: '12', value: [false, 'true']}
							   ]
							}
						};
			}
		}else if (name === 'countries_references'){
			if(dojo.isBrowser){
				data = {url: require.toUrl('./countries_references.json')};
			}else{
				data = {data: { identifier: 'name',
								label: 'name',
								items: [
									{ name:'Africa', type:'continent',
										children:[{_reference:'Egypt'}, {_reference:'Kenya'}, {_reference:'Sudan'}] },
									{ name:'Egypt', type:'country' },
									{ name:'Kenya', type:'country',
										children:[{_reference:'Nairobi'}, {_reference:'Mombasa'}] },
									{ name:'Nairobi', type:'city' },
									{ name:'Mombasa', type:'city' },
									{ name:'Sudan', type:'country',
										children:{_reference:'Khartoum'} },
									{ name:'Khartoum', type:'city' },
									{ name:'Asia', type:'continent',
										children:[{_reference:'China'}, {_reference:'India'}, {_reference:'Russia'}, {_reference:'Mongolia'}] },
									{ name:'China', type:'country' },
									{ name:'India', type:'country' },
									{ name:'Russia', type:'country' },
									{ name:'Mongolia', type:'country' },
									{ name:'Australia', type:'continent', population:'21 million',
										children:{_reference:'Commonwealth of Australia'}},
									{ name:'Commonwealth of Australia', type:'country', population:'21 million'},
									{ name:'Europe', type:'continent',
										children:[{_reference:'Germany'}, {_reference:'France'}, {_reference:'Spain'}, {_reference:'Italy'}] },
									{ name:'Germany', type:'country' },
									{ name:'France', type:'country' },
									{ name:'Spain', type:'country' },
									{ name:'Italy', type:'country' },
									{ name:'North America', type:'continent',
										children:[{_reference:'Mexico'}, {_reference:'Canada'}, {_reference:'United States of America'}] },
									{ name:'Mexico', type:'country',  population:'108 million', area:'1,972,550 sq km',
										children:[{_reference:'Mexico City'}, {_reference:'Guadalajara'}] },
									{ name:'Mexico City', type:'city', population:'19 million', timezone:'-6 UTC'},
									{ name:'Guadalajara', type:'city', population:'4 million', timezone:'-6 UTC' },
									{ name:'Canada', type:'country',  population:'33 million', area:'9,984,670 sq km',
										children:[{_reference:'Ottawa'}, {_reference:'Toronto'}] },
									{ name:'Ottawa', type:'city', population:'0.9 million', timezone:'-5 UTC'},
									{ name:'Toronto', type:'city', population:'2.5 million', timezone:'-5 UTC' },
									{ name:'United States of America', type:'country' },
									{ name:'South America', type:'continent',
										children:[{_reference:'Brazil'}, {_reference:'Argentina'}] },
									{ name:'Brazil', type:'country', population:'186 million' },
									{ name:'Argentina', type:'country', population:'40 million' }
								]
							}
						};
			}
		}
		return data;
	};
});
