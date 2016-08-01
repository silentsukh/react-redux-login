import React, {PropTypes} from 'react';
import TextField from 'material-ui/TextField';
import * as validators from '../validators';

export default class Text extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			errors:[]
		};

		this._updateValue = (value) => this.updateValue(value);
		this._isValid = (showErrors) => this.isValid(showErrors);

		this._onChange = (event) => this.onChange(event);
		this._onBlur = () => this.onBlur();
	}
	isValid(showErrors) {
		const errors = this.props.validate
			.reduce( (memo, currentName) => memo.concat( validators[currentName]( this.context.values[this.props.name] ) ), [] );

		if (showErrors) {
			this.setState({
				errors
			});
		}
		return !errors.length;
	}
	updateValue(value) {
		this.context.update(this.props.name, value);

		if (this.state.errors.length) {
			setTimeout( () => this._isValid(true), 0 );
		}
	}
	onChange(event) {
		this._updateValue(event.target.value);
	}
	onBlur() {
		this._isValid(true);
	}
	componentWillMount() {
		this.removeValidationFromContext = this.context.registerValidation(show => this.isValid(show));
	}
	componentWillUnmount() {
		this.removeValidationFromContext();
	}
	render() {
		return (
			<div>
				<TextField
					hintText={this.props.placeholder}
					floatingLabelText={this.props.label}
					value={this.context.values[this.props.name] || ''}
					onChange={this._onChange}
					onBlur={this._onBlur}
					errorText={this.state.errors.length ? (
						<div>
							{this.state.errors.map( (error, i) => <div key={i}>{error}</div>)}
						</div>
					) : null}
					fullWidth={true}
				/>
			</div>
		);
	}
}

Text.propTypes = {
	name: PropTypes.string.isRequired,
	placeholder: PropTypes.string,
	label: PropTypes.string,
	validate: PropTypes.arrayOf(PropTypes.string)
};

Text.contextTypes = {
	update: PropTypes.func.isRequired,
	values: PropTypes.object.isRequired,
	registerValidation: PropTypes.func.isRequired
};

Text.defaultProps = {
	validate: []
};