import { ObservableArray, ObservableObject, StacheElement, type } from "can";

// this breaks the bundled-es build, so leaving it out for now
import "./queues-logstack.less";

class Task extends ObservableObject {
	static get props() {
		return {
			queue: String,
			context: String,
			functionName: String,
			metaLog: String,
			metaReasonLog: String
		};
	}
}

class TaskList extends ObservableArray {
	static get props() {
		return {};
	}

	static get items() {
		return type.convert(Task);
	}
}

export default class QueuesLogstack extends StacheElement {
	static get view() {
		return `
			{{# if(this.stack) }}
				{{# unless(this.stack.length) }}
					No tasks on the can-queues.stack
				{{ else }}
					<ul>
						{{# for(task of this.displayStack) }}
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
		`;
	}

	static get props() {
		return {
			stack: {
				type: type.convert(TaskList),

				get default() {
					return new TaskList();
				}
			},

			selectedTask: {
				value({ listenTo, lastSet, resolve }) {
					listenTo(lastSet, resolve);

					const resolveLastTaskWithAnFn = stack => {
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

			inspectTask: {
				get default() {
					return index =>
						console.log("inspecting " + this.stack[index].functionName);
				}
			}
		};
	}

	selectTask(task) {
		this.selectedTask = task;
		if (task.functionName) {
			this.inspectTask(this.stack.indexOf(task));
		}
	}

	connected() {
		const win = this.ownerDocument.defaultView;
		// height of window is static in devtools panels
		// set the height of <queues-logstack> also so scrollbar will be displayed
		this.style.height = `${win.innerHeight}px`;
	}
}

customElements.define("queues-logstack", QueuesLogstack);

export { StacheElement, ObservableArray };
