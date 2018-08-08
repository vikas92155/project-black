import _ from 'lodash';

import { 
	CREATE_HOST, 
	DELETE_HOST, 
	RENEW_HOSTS,
	UPDATE_HOST,
	UPDATED_IPS,
	RESOLVE_HOSTS,
	HOST_DATA_UPDATED,
	GET_TASKS_BY_HOSTS
} from './actions.js'


const initialState = {
	"page": 0,
	"page_size": 12,
	"resolve_finished": false,
	"total_db_hosts": 0,
	"selected_hosts": 0,
	"data": [],
	"tasks": {
		"active": [],
		"finished": []
	}
}

function create_host(state = initialState, action) {
	const message = action.message;

	if (message["status"] == 'success') {
		let new_state = JSON.parse(JSON.stringify(state));
		let new_hosts = message.new_hosts;

		new_state.data = new_hosts.concat(new_state.data).slice(0, new_state.page_size);
		new_state.total_db_hosts += new_hosts.length;

		new_state.update_needed = false;			

		return new_state;
	} else {
		/* TODO: add error handling */
	}
}

function delete_host(state = initialState, action) {
	const message = action.message;

	if (message["status"] == 'success') {
		var new_state = JSON.parse(JSON.stringify(state));
		new_state.update_needed = true;

		return new_state;
	} else {
		/* TODO: add error handling */
	}
}

function renew_hosts(state = initialState, action) {
	const message = action.message;

	if (message["status"] == 'success') {
		return {
			...message.hosts,
			'update_needed': false
		}
	} else {
		/* TODO: add error handling */
	}
}

function update_host(state = initialState, action) {
	const message = action.message;

	if (message["status"] == "success") {
		var { host_id, comment } = message;

		for (var each_host of state.data) {
			if (each_host.host_id == host_id) {
				var new_state = JSON.parse(JSON.stringify(state));

				for (var each_new_host of new_state.data) {
					if (each_new_host.host_id == host_id) {
						each_new_host.comment = comment;
						break;
					}
				}

				return new_state;
			}
		}

		return state;
	} else {
		console.error(message);
		/* TODO: add error handling */
	}

}

function host_data_updated(state = initialState, action) {
	const message = action.message;

	if (message["status"] == 'success') {
		var found = false;

		if (message.updated_hostname) {
			for (var state_host of state.data) {
				if (state_host.hostname == message.updated_hostname) {
					console.log("Got some files for currently displayed hosts");
					found = true;
					break;
				}
			}
		}

		if (found) {
			var new_state = JSON.parse(JSON.stringify(state));
			new_state.update_needed = true;

			return new_state;
		}
		else {
			return state;
		}
	} else {
		/* TODO: add error handling */
	}	
}

function updated_ips(state = initialState, action) {
	const message = action.message;

	if (message["status"] == 'success') {
		var found = false;

		if (message.updated_ips) {
			for (var each_id of message.updated_ips) {
				for (var state_host of state.data) {
					for (var state_ip of state_host.ip_addresses) {
						if (state_ip.ip_id == each_id) {
							console.log("Got some scans for currently displayed hosts");
							found = true;
							break;
						}
					}
				}
				if (found) break;
			}
		}

		if (found) {
			var new_state = JSON.parse(JSON.stringify(state));

			new_state.update_needed = true;

			return new_state;
		}
		else {
			return state;
		}
	} else {
		/* TODO: add error handling */
	}
}

function resolve_hosts(state = initialState, action) {
	const message = action.message;

	if (message["status"] == 'success') {
		var new_state = JSON.parse(JSON.stringify(state));
		new_state.update_needed = true;
		new_state.resolve_finished = true;

		return new_state;
	} else {
		/* TODO: add error handling */
	}
}


function get_tasks_by_hosts(state = initialState, action) {
	const message = action.message;

	if (message["status"] == 'success') {
		const active_tasks = message['active'];

		var parsed_active_tasks = _.map(active_tasks, (x) => {
			return {
				"task_id": x["task_id"],
				"task_type": x["task_type"],
				"params": x["params"],
				"target": x["target"],
				"status": x["status"],
				"progress": x["progress"],
				"project_uuid": x["project_uuid"],
				"text": x["text"],
				"stdout": x["stdout"],
				"stderr": x["stderr"],
				"date_added": x["date_added"]
			}
		});

		const finished_tasks = message['finished'];

		var parsed_finished_tasks = _.map(finished_tasks, (x) => {
			return {
				"task_id": x["task_id"],
				"task_type": x["task_type"],
				"params": x["params"],
				"target": x["target"],
				"status": x["status"],
				"progress": x["progress"],
				"project_uuid": x["project_uuid"],
				"text": x["text"],
				"stdout": x["stdout"],
				"stderr": x["stderr"],
				"date_added": x["date_added"]
			}
		});

		return {
			"page": state["page"],
			"page_size": state["page_size"],
			"total_db_hosts": state["total_db_hosts"],
			"selected_hosts": state["selected_hosts"],
			"data": state["data"],
			"tasks": {
				"active": parsed_active_tasks,
				"finished": parsed_finished_tasks
			},
			"update_needed": state["update_needed"]			
		};
	} else {
		/* TODO: add error handling */
	}	
	return state;
}

function host_reduce(state = initialState, action) {
	if (!action.hasOwnProperty('message')) {
		return state
	}

	else {
		if (action.message && action.current_project_uuid != action.message.project_uuid) { return state; }
		else {
			switch (action.type) {
				case CREATE_HOST:
					return create_host(state, action);
				case DELETE_HOST:
					return delete_host(state, action);
				case RENEW_HOSTS:
					return renew_hosts(state, action);
				case UPDATE_HOST:
					return update_host(state, action);
				case RESOLVE_HOSTS:
					return resolve_hosts(state, action);
				case UPDATED_IPS:
					return updated_ips(state, action);	
				case HOST_DATA_UPDATED:
					return host_data_updated(state, action);
				case GET_TASKS_BY_HOSTS:
					return get_tasks_by_hosts(state, action);					
				default:
					return state;
			}
		}
	}
}



export default host_reduce
