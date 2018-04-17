import Component from 'can-component';
import './<%= name %>.less';

export const ViewModel = DefineMap.extend();

export default Component.extend({
	tag: '<%= tag %>',
	ViewModel: {
		message: {
			default: 'This is the <%= tag %> component'
		}
	},
	view: `
		<p>{{message}}</p>
	`
});
