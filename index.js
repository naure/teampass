defaultNames = ["admin", "email", "website", ""]
try {
	loadedNames = JSON.parse(localStorage.teampass_names || defaultNames)
} catch(err) {
	loadedNames = defaultNames
}

var vue = new Vue({
	el: '#vue',

	data: {
		seed: "",
		names: loadedNames,
		passColor: true,
		asKey: false,
	},

	computed: {
	},

	methods: {
		update: function(e) {
			this.seed = ""
			var master = e.target.value
			this.setSeed(master)
		},
		
		setSeed: _.debounce(function (master) {
			this.seed = master && makeSeed(master)
		}, 200),

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