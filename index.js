defaultNames = ["admin", "email", "website", ""]
try {
	loadedNames = JSON.parse(localStorage.names || defaultNames)
} catch(err) {
	loadedNames = defaultNames
}

var vue = new Vue({
	el: '#editor',

	data: {
		seed: "",
		names: loadedNames,
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
			try {
				localStorage.names = JSON.stringify(names)
			} catch(err) {}
		}
	}
})