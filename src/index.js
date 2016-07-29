import React from 'react';
import ReactDOM from 'react-dom';
import Form, {Text, SubmitButton} from './app';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

ReactDOM.render(
	<MuiThemeProvider>
		<Form onSubmit={data => console.log(data)}>
			<Text
				name="apiKey"
				placeholder="Type your API key"
				label="API Key"
				validate={['required']}
			/>
			<Text
				name="email"
				placeholder="Type your email"
				label="Email"
				validate={['required', 'email']}
			/>
			<Text
				name="password"
				placeholder="Type your Password"
				label="Password"
				validate={['required']}
				type="password"
			/>

			<SubmitButton />
		</Form>
	</MuiThemeProvider>
	, document.getElementById('content'));