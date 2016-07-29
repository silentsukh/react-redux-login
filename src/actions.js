import * as _ from './constants';

export function update(name, value)  {
	return dispatch => dispatch({
		type: _.FORM_UPDATE_VALUE,
		name, value
	});
}

export function reset() {
	return dispatch => dispatch({
		type: _.FORM_RESET
	});
}