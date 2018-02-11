defaultNames = ["wifi", "website", "support", ""]
try {
	loadedNames = JSON.parse(localStorage.teampass_names || defaultNames)
} catch(err) {
	loadedNames = defaultNames
}

var vue = new Vue({
	el: '#vue',

	data: {
		master: "",
		seed: null,
		names: loadedNames,
		passColor: true,
		asKey: false,
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
			if(this.asKey) {
				return makeKey(this.seed, name);
			} else {
				return makePass(this.seed, name);
			}
		},

		checksumStyle: function(name) {
			var color = name ? makeColor(name) : "#f6f6f6"
			return {"border-bottom": "10px solid " + color}
		}
	},

	watch: {

		master: function() {
			this.seed = null
			if(this.master) {
				this.startHashing(this.master)
			}
		},

		names: function(names) {

			// Auto create or delete empty fields
			var numEmptyAtTheEnd = 0
			for(var i=names.length-1; i >= 0; i--) {
				if(!names[i]) numEmptyAtTheEnd++;
				else break;
			}
			if(numEmptyAtTheEnd === 0) {
				this.names.push("")
			} else if(numEmptyAtTheEnd >= 2) {
				this.names.pop()
			}

			try {
				localStorage.teampass_names = JSON.stringify(this.names)
			} catch(err) {}
		}
	}
})
