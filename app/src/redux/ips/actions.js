export const CREATE_IP = 'CREATE_IP'
export const DELETE_IP = 'DELETE_IP'
export const RENEW_IPS = 'RENEW_IPS'
export const UPDATE_IP = 'UPDATE_IP'
export const UPDATED_IPS = 'UPDATED_IPS'
export const GET_TASKS_BY_IPS = 'GET_TASKS_BY_IPS'
export const SET_LOADED = 'SET_LOADED'


export function createIP(message, current_project_uuid) {
	return {
		type: CREATE_IP,
		current_project_uuid: current_project_uuid,
		message
	}
}

export function deleteIP(message, current_project_uuid) {
	return {
		type: DELETE_IP,
		current_project_uuid: current_project_uuid,
		message
	}
}

export function updateIP(message, current_project_uuid) {
	return {
		type: UPDATE_IP,
		current_project_uuid: current_project_uuid,
		message
	}
}

export function updatedIPs(message, current_project_uuid) {
	return {
		type: UPDATED_IPS,
		current_project_uuid: current_project_uuid,
		message
	}
}

export function getByIps(message, current_project_uuid) {
	return { type: GET_TASKS_BY_IPS,
		current_project_uuid: current_project_uuid,
		message
	}
}

export function setLoaded(message, current_project_uuid) {
	return { type: SET_LOADED,
		current_project_uuid: current_project_uuid,
		message
	}
}

////// 

export const RECEIVE_IPS = 'RECEIVE_IPS'
export function receiveIPs(message) {
	return { type: RECEIVE_IPS, message }
}


export function requestSingleIP(project_uuid, ip_address) {
	return dispatch => {
		dispatch(setLoadingIPs(true));
		dispatch(fetchSingleIP(project_uuid, ip_address)).then(() => {
			dispatch(setLoadingIPs(false))
		});
	}
}

export function fetchSingleIP(project_uuid, ip_address) {
	return dispatch =>
		fetch(`/project/${project_uuid}/ip/get/${ip_address}`)
			.then(
				response => response.json(),
				error => console.log(error)
			)
			.then(
				json => dispatch(receiveIPs(json))
			)
}


export function requestIPs(project_uuid, filters={}, ip_page=0, ip_page_size=12) {
	const params = {
		filters: filters,
		ip_page: ip_page,
		ip_page_size: ip_page_size,
	}

	return dispatch => {
		dispatch(setLoadingIPs(true));
		dispatch(fetchIPs(project_uuid, params)).then(() => {
			dispatch(setLoadingIPs(false))
		});
	}
}


export const SET_LOADING_IPS = 'SET_LOADING_IPS'
export function setLoadingIPs(isLoading) {
	return { type: SET_LOADING_IPS, isLoading }
}

export function fetchIPs(project_uuid, params) {
	const filters = encodeURIComponent(JSON.stringify(params['filters']));

	const queryFields = [
		`filters=${filters}`,
		`ip_page=${params['ip_page']}`,
		`ip_page_size=${params['ip_page_size']}`,
	];

	const query = queryFields.join('&');

	return dispatch =>
		fetch(`/project/${project_uuid}/ips?${query}`)
			.then(
				response => response.json(),
				error => console.log(error)
			)
			.then(
				json => dispatch(receiveIPs(json))
			)
}
