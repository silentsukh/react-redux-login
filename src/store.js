import * as _ from './constants';
import assign from 'lodash.assign';

const initialState = {
	values: {}
};

export default (state = initialState, action) => {
	switch (action.type) {
		case _.FORM_UPDATE_VALUE:
			return assign( {}, state, {
				values: assign( {}, state.values, {
					[action.name]: action.value
				})
			});
		break;
		case _.FORM_RESET:
			return initialState;
		break;

		default:
			return state;
	}
}