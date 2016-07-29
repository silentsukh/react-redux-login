import React, {PropTypes} from 'react';
import without from 'lodash.without';
import assign from 'lodash.assign';

const noop = () => undefined;

export default class Form extends React.Component {
	constructor(props) {
		super(props);
		
		this.validations = [];

		this.registerValidation = (isValidFunc) => this._registerValidation(isValidFunc);
		this.removeValidation = (ref) => this._removeValidation(ref);
		this.isFormValid = (showErrors) => this._isFormValid(showErrors);
		this.submit = () => this._submit();
	}
	_registerValidation(isValidFunc) {
		this.validations = [...this.validations, isValidFunc];
		return this.removeValidation.bind(null, isValidFunc);
	}
	_removeValidation(ref) {
		this.validations = without(this.validations, ref);
	}
	_isFormValid(showErrors) {
		return this.validations.reduce( (memo, isValidFunc) => isValidFunc(showErrors) && memo, true );
	}
	_submit() {
		if (this.isFormValid(true)) {
			this.props.onSubmit( assign( {}, this.props.values ) );
			this.props.reset();
		}
	}
	getChildContext() {
		return {
			update: this.props.update,
			reset: this.props.reset,
			submit: this.submit,
			values: this.props.values,
			registerValidation: this.registerValidation,
			isFormValid: this.isFormValid
		}
	}
	render() {
		return (
			<form>
				{this.props.children}
			</form>
		);
	}
}

Form.propTypes = {
	children: PropTypes.node,
	values: PropTypes.object,
	update: PropTypes.func,
	reset: PropTypes.func,
	onSubmit: PropTypes.func
};

Form.childContextTypes = {
	update: PropTypes.func,
	reset: PropTypes.func,
	submit: PropTypes.func,
	values: PropTypes.object,
	registerValidation: PropTypes.func,
	isFormValid: PropTypes.func
};

Form.defaultProps = {
	onSubmit: noop
}