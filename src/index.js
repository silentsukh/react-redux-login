import React from 'react';
import ReactDOM from 'react-dom';
import Form, {Text, SubmitButton} from './app';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
const styles = {
	headline: {
		fontSize: 32,
		fontWeight: 400,
		fontFamily: 'Roboto, sans-serif'
	}
};
class App extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<MuiThemeProvider>
				<div className="col-sm-8 col-sm-offset-2">
			        <h1 style={styles.headline}>IG Login</h1>
					<Form onSubmit={data => console.log(data)}>
						<div className="row">
							<div className="col-xs-12 col-sm-6">
								<Text
									name="apiKey"
									placeholder="Type your API key"
									label="API Key"
									validate={['required']}
								/>
							</div>
						</div>
						<div className="row">
							<div className="col-xs-12 col-sm-6">
								<Text
									name="email"
									placeholder="Type your email"
									label="Email"
									validate={['required', 'email']}
								/>
							</div>
							<div className="col-xs-12 col-sm-6">
								<Text
									name="password"
									placeholder="Type your Password"
									label="Password"
									validate={['required']}
									type="password"
								/>
							</div>
						</div>
						<div className="row">
							<div className="col-xs-3">
								<SubmitButton label="Login" />
							</div>
						</div>
					</Form>
				</div>
			</MuiThemeProvider>
		);
	}
}
ReactDOM.render(
	<App />
	, document.getElementById('content'));