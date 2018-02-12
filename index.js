
// Prepare password names
try {
	// Names from storage
	var initNames = JSON.parse(localStorage.teampass_names)
} catch(err) {
	// Default names
	var initNames = ["wifi", "website", "support"]
}
// Names from URL
if(location.hash.startsWith("#names=")) {
	var urlNames = location.hash.substr("#names=".length).split(",")
	initNames = initNames.concat(urlNames)
}
// Deduplicate names
initNames = _.uniq(initNames)


var icons = [
	"bicycle", "bus", "space-shuttle", "paper-plane", "shower",
	"birthday-cake", "chess", "coffee", "futbol", "tree",
	"fire-extinguisher", "bath", "gamepad", "music", "umbrella",
	"gift", "glass-martini", "anchor", "balance-scale", "leaf",
]

var vue = new Vue({
	el: '#vue',

	data: {
		master: "",
		seed: null,
		names: initNames,
		passColor: true,
		showPass: false,
		outputFormat: "password",
		settingsInUrl: false,
	},

	computed: {},

	methods: {

		startHashing: _.debounce(function (master) {
			var self = this

			function progressCb(next, seed) {
				console.log("STEP  ", master.length, !!next, seed&&seed.length)
				if(master !== self.master) {
					console.log("CANCEL", master.length)
					return // Stop because the input has changed
				}
				if(next) {
					// Continue after UI is idle
					Vue.nextTick(function() {
						setTimeout(next, 1)
					});
				} else {
					// Finished, output result
					self.seed = seed
				}
			}

			console.log("START ", master.length)
			makeSeedAsync(master, progressCb)

		}, 300),

		getPass: function(name) {
			if(!this.seed) return undefined;
			if(this.outputFormat == "hex") {
				return makeKey(this.seed, name);
			} else if(this.outputFormat == "pin") {
				return makePin(this.seed, name);
			} else {
				return makePass(this.seed, name);
			}
		},

		getHidden: function(name) {
			if(this.outputFormat == "hex") {
				return "0x****************************************************************";
			} else if(this.outputFormat == "pin") {
				return "******";
			} else {
				return "********************";
			}
		},

		checksumStyle: function(name) {
			var color = name ? makeColor(name) : "#f6f6f6"
			return {"border-bottom": "10px solid " + color}
		},

		checksumPass: function() {
			return (this.master && !this.seed) ?
				"fas fa-fw fa-spinner fa-spin" :
				this.checksumName(this.seed);
		},

		checksumName: function(name) {
			if(!name) {
				var icon = "keyboard"
			} else {
				var icon = icons[ makeCode(name) % icons.length ]
			}
			return "fas fa-fw fa-" + icon
		},

		updateNames: function() {
			// Auto create or delete empty fields
			var numEmptyAtTheEnd = 0
			for(var i=this.names.length-1; i >= 0; i--) {
				if(!this.names[i]) numEmptyAtTheEnd++;
				else break;
			}
			if(numEmptyAtTheEnd === 0) {
				this.names.push("")
			} else if(numEmptyAtTheEnd >= 2) {
				this.names.pop()
			}

			try {
				var toStore = _.compact(this.names)
				localStorage.teampass_names = JSON.stringify(toStore)
			} catch(err) {}
		},

		updateUrl: function() {
			if(!this.settingsInUrl) return;

			// To URL
			location.hash = "names=" + this.names.join(",")
		}
	},

	mounted: function() {
		new Clipboard('.copyable');

		this.updateNames();
	},

	watch: {

		master: function() {
			this.seed = null
			if(this.master) {
				this.startHashing(this.master)
			}
		},

		names: function(names) {
			this.updateNames()
			this.updateUrl()
		},

		settingsInUrl: function() {
			this.updateUrl()
		},
	}
})
