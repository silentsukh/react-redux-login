import emailValidator from 'email-validator';

export function required(value) {
	return !value ? ['This field cannot be empty'] : [];
}

export function email(value) {
	return !emailValidator.validate(value) ? ['This email address is invalid'] : [];
}