import Component from "can-component";
import DefineList from "can-define/list/list";
import "./queues-logstack.less";

export default Component.extend({
	tag: "queues-logstack",
	ViewModel: {
		stack: { Type: DefineList, Default: DefineList },
		selectedTask: {
			value({ listenTo, lastSet, resolve }) {
				listenTo(lastSet, resolve);

				listenTo("stack", (ev, stack) => {
					resolve( stack[stack.length - 1] );
				});

				if (this.stack) {
					resolve( this.stack[this.stack.length - 1] );
				}
			}
		},

		get displayStack() {
			return this.stack.slice().reverse();
		},

		selectTask(task) {
			this.selectedTask = task;
			this.inspectTask( this.stack.indexOf(task) );
		},

		inspectTask(index) {
			console.log("inspecting " + this.stack[index].fn);
		}
	},
	view: `
		{{#if(stack)}}
            {{#unless(stack.length}}
                No tasks on the can-queues.stack
            {{else}}
				<ul>
					{{#each(displayStack, task=value index=index)}}
						<li
							on:click="scope.vm.selectTask(task)"
							class="{{#eq(index, 0)}}first{{/eq}} {{#eq(task, scope.vm.selectedTask)}}selected{{/eq}}"
						>
							{{task.fn}}
						</li>
					{{/each}}
				</ul>
            {{/unless}}
        {{/if}}
	`,

	events: {
		"li mouseover": function(li) {
			li.classList.add("highlight");
		},

		"li mouseout": function(li) {
			li.classList.remove("highlight");
		}
	}
});
