import Component from "can-component";
import "viewmodel-editor/viewmodel-editor.less";

export default Component.extend({
	tag: "viewmodel-editor",
	ViewModel: {
		message: {
			default: "This is the viewmodel-editor component"
		}
	},
	view: `
		<p>{{message}}</p>
	`
});
