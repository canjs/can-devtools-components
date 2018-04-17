import Component from "can-component";
import DefineList from "can-define/list/list";
import "./queues-logstack.less";

export default Component.extend({
	tag: "queues-logstack",
	ViewModel: {
		stack: DefineList,

		functionClickHandler: function(index) {
			console.log("inspecting " + this.stack[index].fn);
		}
	},
	view: `
		{{#if(stack)}}
            {{#unless(stack.length}}
                No tasks on the can-queues.stack
            {{else}}
                <table>
                    <tbody>
                        <tr>
                            <th>#</th>
                            <th>Queue</th>
                            <th>Reason</th>
                            <th>Function</th>
                        </tr>
                        {{#each(stack, task=value index=index)}}
                        <tr>
                            <td>{{index}}</td>
                            <td>{{task.queue}}</td>
                            <td>{{task.reason}}</td>
                            <td>
                                <a on:click="scope.root.functionClickHandler(index)" href="#">
                                    {{task.fn}}
                                </a>
                            </td>
                        </tr>
                        {{/each}}
                    </tbody>
                </table>
            {{/unless}}
        {{/if}}
	`
});
