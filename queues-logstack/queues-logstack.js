import { Component, DefineList, DefineMap } from "can";

// this breaks the bundled-es build, so leaving it out for now
import "./queues-logstack.less";

const Task = DefineMap.extend("Task", {
	queue: "string",
	context: "string",
	functionName: "string",
	metaLog: "string",
	metaReasonLog: "string",
});

const TaskList = DefineList.extend("TaskList", {
	"#": Task
});

export default Component.extend({
	tag: "queues-logstack",
	ViewModel: {
		connectedCallback(el) {
			const win = el.ownerDocument.defaultView;
			// height of window is static in devtools panels
			// set the height of <queues-logstack> also so scrollbar will be displayed
			el.style.height = `${win.innerHeight}px`;
		},

		stack: { Type: TaskList, Default: TaskList },

		selectedTask: {
			value({ listenTo, lastSet, resolve }) {
				listenTo(lastSet, resolve);

				const resolveLastTaskWithAnFn = (stack) => {
					for (let i = stack.length - 1; i >= 0; i--) {
						let task = stack[i];
						if (task.functionName) {
							return resolve(task);
						}
					}
				};

				listenTo("stack", (ev, stack) => {
					resolveLastTaskWithAnFn(stack);
				});

				if (this.stack) {
					resolveLastTaskWithAnFn(this.stack);
				}
			}
		},

		get displayStack() {
			return this.stack.slice().reverse();
		},

		selectTask(task) {
			this.selectedTask = task;
			if (task.functionName) {
				this.inspectTask( this.stack.indexOf(task) );
			}
		},

		inspectTask: {
			default() {
				return (index) => console.log("inspecting " + this.stack[index].functionName);
			}
		}
	},
	view: `
		{{# if(stack) }}
            {{# unless(stack.length) }}
                No tasks on the can-queues.stack
            {{else}}
				<ul>
					{{# for(task of displayStack) }}
						{{ let isHighlighted = false }}

						{{# eq(scope.index, 0) }}
							<li class="first">
								<p>{{ task.metaReasonLog }}</p>
							</li>
						{{/ eq }}

						{{# if(task.functionName) }}
							<li
								on:click="scope.vm.selectTask(task)"
								class="{{# eq(scope.index, 0) }}first{{/ eq }} {{# eq(task, scope.vm.selectedTask) }}selected{{/ eq }} {{# if(isHighlighted) }}highlight{{/ if }}"
								on:mouseenter="isHighlighted = true"
								on:mouseleave="isHighlighted = false"
							>
								<p>{{ task.queue }} ran task: {{ task.functionName }}</p>
								{{# if(task.metaReasonLog) }}
									<p class="reason">{{ task.metaReasonLog }}</p>
								{{/ if }}
							</li>
						{{/ if }}
					{{/ for }}
				</ul>
            {{/ unless }}
        {{/ if }}
	`
});

export { Component, DefineList };
