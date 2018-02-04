var vue = new Vue({
	el: '#editor',

	data: {
		master: 'Coucou!',
		names: ["admin", "email", "website", ""],
		customName: "",
	},

	computed: {
	},

	methods: {
		update: _.debounce(function (e) {
			this.master = e.target.value
		}, 100),

		checksumStyle: function(name) {
			return {"border-bottom": "10px solid "+ makeColor(name)}
		}
	}
})