import React from 'react';
import ReactDOM from 'react-dom';
import Form, {Text, SubmitButton} from './app';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import IG from '../src/lib/ig';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.formSubmit = (e) => this._formSubmit(e);

		this.IG = new IG();
	}
	_formSubmit(e) {
		if(this.IG.login(e.apiKey, e.username, e.password)) {
			console.log("Logged in!");
			this.IG.connectToLightstreamer();
			this.IG.subscribeToLightstreamerTradeUpdates();

		}
	}
	render() {
		return (
			<MuiThemeProvider>
				<div className="col-sm-8 col-sm-offset-2">
			        <h1>IG Login</h1>
					<Form onSubmit={this.formSubmit}>
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
									name="username"
									placeholder="Type your username"
									label="Username"
									validate={['required']}
								/>
							</div>
							<div className="col-xs-12 col-sm-6">
								<Text
									reference="password"
									name="password"
									type="password"
									placeholder="Type your Password"
									label="Password"
									validate={['required']}
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