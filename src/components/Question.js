import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import difference from 'lodash.difference';
import { getAnswerStatus, setAnswerStatus, getAnswer, setAnswer } from '../data';
import Picture from './Picture';

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
					id: i,
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

	getNewPicture = async type => {
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

	revealClue = async type => {
		const {
			questionId,
			questionQuery: { updateQuery },
			client: { query },
		} = this.props;

		const result = await query({
			query: REVEAL_CLUE_QUERY,
			variables: { id: questionId, type },
		});
		const clue = result.data.revealClue;

		updateQuery((previousResult, { variables }) => {
			const updatedQuestion = {};
			updatedQuestion[type] = {
				...previousResult.question[type],
				clue,
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

	getOptionsContent = options => (
		<div className="lh-title tracked">
			{options.map(opt => (
				<a
					key={opt.id}
					className={`f4 link dim br2 ba bw1 ph3 pv2 dib black ttc ma1 w15p${
						opt.isUsed ? ' hidden' : ''
					}`}
					href={`#${opt.key}`}
					onClick={e => this.handleOptionsKeyClick(e, opt.id)}
				>
					{opt.key}
				</a>
			))}
		</div>
	);

	render() {
		const { answerKeys, options } = this.state;
		const {
			questionQuery: { loading, error, question },
		} = this.props;

		if (loading) {
			return <div className="tc">Question loading...</div>;
		}

		if (error) {
			return <div className="tc">Question loading failed</div>;
		}

		const { id, picture1, picture2 } = question;
		const answerStatus = getAnswerStatus(id);

		return (
			<div className="mb3">
				<div className="flex justify-around mb3">
					<Picture
						url={picture1.url}
						clue={picture1.clue}
						type="picture1"
						getNewPicture={this.getNewPicture}
						revealClue={this.revealClue}
					/>
					<Picture
						url={picture2.url}
						clue={picture2.clue}
						type="picture2"
						getNewPicture={this.getNewPicture}
						revealClue={this.revealClue}
					/>
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
						{this.getOptionsContent(Object.values(options).slice(0, 7))}
						{this.getOptionsContent(Object.values(options).slice(7))}
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
				clue
			}
			picture2 {
				url
				clue
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

const REVEAL_CLUE_QUERY = gql`
	query RevealClueQuery($id: ID!, $type: String!) {
		revealClue(id: $id, type: $type)
	}
`;

export default graphql(QUESTION_QUERY, {
	name: 'questionQuery',
	options: ownProps => ({
		variables: { id: ownProps.questionId },
	}),
})(withApollo(Question));
