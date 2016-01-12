//configuration.mock.js
var mockConfig = {
	"RESTURI": "http://localhost:3002/odata",
	"AUTHURI": "http://noinfopath-rest.img.local",
	"NOREST": "http://noinfopath-rest.img.local",
	"IndexedDB" : {
		"name": "NoInfoPath-v3",
		"version": 1
	},
	"localStores":{
		"nonDBStores": [
			"noConfig",
			"no-nav-bar",
			"noDbSchema_FCFNv2",
			"noDbSchema_FCFNv2_Remote",
			"noDbSchema_NoInfoPath_dtc_v1",
			"Dexie.Observable/latestRevision/NoInfoPath_dtc_v1",
			"debug"
		],
		"dbStores": {
			"clearDB": true,
			"stores":[
				"dbPopulated_NoInfoPath_dtc_v1",
				"dbPopulated_FCFNv2"
			]
		}
	}
};
