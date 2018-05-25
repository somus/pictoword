import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import difference from 'lodash.difference';
import { getAnswerStatus, setAnswerStatus, getAnswer, setAnswer } from '../data';

class Question extends Component {
	state = {
		answerKeys: [],
		options: {},
	};

	static propTypes = {
		questionId: PropTypes.string.isRequired,
		questionQuery: PropTypes.shape({
			loading: PropTypes.bool.isRequired,
			refetch: PropTypes.func.isRequired,
			updateQuery: PropTypes.func.isRequired,
			error: PropTypes.object,
			question: PropTypes.object,
		}).isRequired,
		client: PropTypes.shape({
			query: PropTypes.func.isRequired,
		}).isRequired,
	};

	static getDerivedStateFromProps(nextProps, prevState) {
		const {
			questionId,
			questionQuery: { loading, refetch, question },
		} = nextProps;
		const cachedAnswer = getAnswer(questionId);

		// Update state during initial load and when a new question is loaded
		if (
			(prevState.answerKeys.length === 0 && !loading && question) ||
			(question &&
				difference(question.optionKeys, Object.values(prevState.options).map(o => o.key)).length >
					0)
		) {
			const answerKeys =
				cachedAnswer && cachedAnswer !== ''
					? cachedAnswer.split('')
					: new Array(question.answerLength).fill('_');
			const options = {};
			question.optionKeys.forEach((key, i) => {
				options[i] = {
					key,
					isUsed: false,
				};
			});

			return {
				answerKeys,
				options,
			};
		}

		if (question && question.id !== questionId) {
			// Fetch the new question
			refetch({ id: questionId });
		}

		return null;
	}

	handleOptionsKeyClick = async (e, optId) => {
		e.preventDefault();
		const { answerKeys, options } = this.state;
		const {
			client: { query },
			questionId,
		} = this.props;

		answerKeys.every((ansKey, index) => {
			if (ansKey === '_') {
				answerKeys[index] = optId;
				return false;
			}

			return true;
		});
		options[optId].isUsed = true;

		this.setState({
			answerKeys,
			options,
		});

		// All of the alphabet spots are used
		if (answerKeys.every(ansKey => ansKey !== '_')) {
			// Check for the correctness of the answer and update localstorage
			const answer = answerKeys.map(ansKeyId => options[ansKeyId].key).join('');
			const isAnswerCorrect = (await query({
				query: CHECK_ANSWER_QUERY,
				variables: { id: questionId, answer },
			})).data.checkAnswer;

			setAnswerStatus(questionId, isAnswerCorrect ? 'correct' : 'incorrect');
			if (isAnswerCorrect) {
				setAnswer(questionId, answer);
			}
			this.forceUpdate();
		}
	};

	handleAnswerKeyClick = ansKeyId => {
		const { answerKeys, options } = this.state;
		const { questionId } = this.props;
		const answerStatus = getAnswerStatus(questionId);

		if (answerStatus === 'correct') return;

		if (answerKeys.every(ansKey => ansKey !== '_')) {
			// Reset the question status when the first character removed after an incorrect answer
			setAnswerStatus(questionId, 'unanswered');
		}

		const updatedAnswerKeys = answerKeys.map(keyId => {
			if (keyId === ansKeyId) return '_';
			return keyId;
		});
		options[ansKeyId].isUsed = false;

		this.setState({
			answerKeys: updatedAnswerKeys,
			options,
		});
	};

	getNewPicture = async (e, type) => {
		e.preventDefault();

		const {
			questionId,
			questionQuery: { updateQuery },
			client: { query },
		} = this.props;

		const result = await query({
			query: GET_NEW_PICTURE_QUERY,
			fetchPolicy: 'network-only',
			variables: { id: questionId, type },
		});
		const newUrl = result.data.getNewPicture.url;

		updateQuery((previousResult, { variables }) => {
			const updatedQuestion = {};
			updatedQuestion[type] = {
				...previousResult.question[type],
				url: newUrl,
			};

			const result = {
				...previousResult,
				question: {
					...previousResult.question,
					...updatedQuestion,
				},
			};

			return result;
		});
	};

	render() {
		const { answerKeys, options } = this.state;
		const {
			questionQuery: { loading, error, question },
		} = this.props;

		if (loading) {
			return <div className="tc">Loading</div>;
		}

		if (error) {
			return <div className="tc">Question loading failed</div>;
		}

		const { id, picture1, picture2 } = question;
		const answerStatus = getAnswerStatus(id);

		return (
			<div className="mb3">
				<div className="flex justify-around mb3">
					<div className="pr3-ns mb4 mb0-ns w-100 w-45-ns tc">
						<img src={picture1.url} className="db" alt="Clue 1" />
						<a
							href="#reloadPic"
							className="link f5 dib mt2"
							onClick={e => this.getNewPicture(e, 'picture1')}
						>
							Reload
						</a>
					</div>
					<div
						className="pr3-ns mb4 mb0-ns w-100 w-45-ns tc"
						onClick={e => this.getNewPicture(e, 'picture2')}
					>
						<img src={picture2.url} className="db" alt="Clue 2" />
						<a href="#reloadPic" className="link f5 dib mt2">
							Reload
						</a>
					</div>
				</div>
				<div className="pa3 tc ma1">
					{answerKeys.map((keyId, i) => (
						<div
							className="dib pa2 b f2 ttc pointer"
							key={i}
							onClick={() => this.handleAnswerKeyClick(keyId)}
						>
							{keyId === '_' || isNaN(parseInt(keyId, 10)) ? keyId : options[keyId].key}
						</div>
					))}
				</div>
				{answerStatus !== 'correct' ? (
					<div className="tc w-50 center">
						<div className="mb1">
							{Object.keys(options)
								.slice(0, 7)
								.map(optId => (
									<a
										key={optId}
										className={`f4 link dim br2 ba bw1 ph3 pv2 dib black ttc mh1${
											options[optId].isUsed ? ' hidden' : ''
										}`}
										href={`#${options[optId].key}`}
										onClick={e => this.handleOptionsKeyClick(e, optId)}
									>
										{options[optId].key}
									</a>
								))}
						</div>
						<div className="mt1">
							{Object.keys(options)
								.slice(7)
								.map(optId => (
									<a
										key={optId}
										className={`f4 link dim br2 ba bw1 ph3 pv2 dib black ttc mh1${
											options[optId].isUsed ? ' hidden' : ''
										}`}
										href={`#${options[optId].key}`}
										onClick={e => this.handleOptionsKeyClick(e, optId)}
									>
										{options[optId].key}
									</a>
								))}
						</div>
						{answerStatus === 'incorrect' && <p className="f5 b red tc">Incorrect Answer</p>}
					</div>
				) : (
					<p className="f3 b green tc">Correct Answer</p>
				)}
			</div>
		);
	}
}

const QUESTION_QUERY = gql`
	query QuestionQuery($id: ID!) {
		question(id: $id) {
			id
			answerLength
			optionKeys
			picture1 {
				url
			}
			picture2 {
				url
			}
		}
	}
`;

const CHECK_ANSWER_QUERY = gql`
	query CheckAnswerQuery($id: ID!, $answer: String!) {
		checkAnswer(id: $id, answer: $answer)
	}
`;

const GET_NEW_PICTURE_QUERY = gql`
	query GetNewPictureQuery($id: ID!, $type: String!) {
		getNewPicture(id: $id, type: $type) {
			url
		}
	}
`;

export default graphql(QUESTION_QUERY, {
	name: 'questionQuery',
	options: ownProps => ({
		variables: { id: ownProps.questionId },
	}),
})(withApollo(Question));

// export default Question;
