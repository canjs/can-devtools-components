import Component from "can-component";
import "./<%= name %>.less";

export default Component.extend({
	tag: "<%= tag %>",
	ViewModel: {
		message: {
			default: "This is the <%= tag %> component"
		}
	},
	view: `
		<p>{{message}}</p>
	`
});
