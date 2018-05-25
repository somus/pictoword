export function initialize(questionIds) {
	if (window.localStorage.getItem('questionStatus')) return;

	const questionStatus = {};
	questionIds.forEach(qId => {
		questionStatus[qId] = {
			answer: '',
			status: 'unanswered',
		};
	});

	window.localStorage.setItem('questionStatus', JSON.stringify(questionStatus));
}

export function getAllQuestionStatuses() {
	const questionStatus = window.localStorage.getItem('questionStatus');

	return questionStatus && JSON.parse(questionStatus);
}

export function getAnswerStatus(id) {
	const questionStatus = JSON.parse(window.localStorage.getItem('questionStatus'));

	if (questionStatus) {
		return questionStatus[id].status;
	}

	return null;
}

export function setAnswerStatus(id, status) {
	const questionStatus = JSON.parse(window.localStorage.getItem('questionStatus'));
	questionStatus[id].status = status;
	window.localStorage.setItem('questionStatus', JSON.stringify(questionStatus));
}

export function getAnswer(id) {
	const questionStatus = JSON.parse(window.localStorage.getItem('questionStatus'));

	if (questionStatus) {
		return questionStatus[id].answer;
	}

	return null;
}

export function setAnswer(id, answer) {
	const questionStatus = JSON.parse(window.localStorage.getItem('questionStatus'));
	questionStatus[id].answer = answer;
	window.localStorage.setItem('questionStatus', JSON.stringify(questionStatus));
}

export function reset() {
	window.localStorage.removeItem('questionStatus');
}
