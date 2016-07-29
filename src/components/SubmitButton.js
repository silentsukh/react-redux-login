import React, { PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';

export default class SubmitButton extends React.Component {
	render() {
		return (
			<div>
				<RaisedButton
					primary
					disabled={!this.context.isFormValid()}
					label={this.props.label}
					onTouchTap={this.context.submit}
				/>
			</div>
		);
	}
}
SubmitButton.propTypes = {
	label: PropTypes.string
};
SubmitButton.contextTypes = {
	isFormValid: PropTypes.func.isRequired,
	submit: PropTypes.func.isRequired
};
SubmitButton.defaultProps = {
	label: 'Submit'
};