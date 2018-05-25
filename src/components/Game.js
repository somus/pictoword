import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { initialize, reset } from '../data';
import Question from './Question';

class Game extends Component {
	state = { currentQuestionIndex: 0 };

	static propTypes = {
		history: PropTypes.object.isRequired,
		questionsQuery: PropTypes.shape({
			loading: PropTypes.bool.isRequired,
			error: PropTypes.object,
			questions: PropTypes.array,
		}).isRequired,
	};

	componentDidUpdate(prevProps) {
		const {
			questionsQuery: { loading, questions },
		} = this.props;
		if (prevProps.questionsQuery.loading && !loading) {
			initialize(questions.map(q => q.id));
		}
	}

	startOver = e => {
		e.preventDefault();
		reset();
		this.props.history.push('/');
	};

	goToSummary = e => {
		e.preventDefault();
		this.props.history.push('/summary');
	};

	nextQuestion = e => {
		e.preventDefault();
		this.setState({ currentQuestionIndex: this.state.currentQuestionIndex + 1 });
	};

	prevQuestion = e => {
		e.preventDefault();
		this.setState({ currentQuestionIndex: this.state.currentQuestionIndex - 1 });
	};

	render() {
		const { currentQuestionIndex } = this.state;
		const {
			questionsQuery: { loading, error, questions },
		} = this.props;

		if (loading) {
			return <div className="tc">Loading questions...</div>;
		}

		if (error) {
			return <div className="tc">Questions loading failed</div>;
		}

		const currentQuestionId = questions[currentQuestionIndex].id;

		return (
			<div>
				<Question questionId={currentQuestionId} />
				<footer className="flex items-center justify-between pa4">
					<a
						href="#prev"
						className={`f5 no-underline black bg-animate hover-bg-black hover-white inline-flex items-center pa3 ba border-box mr4 ${
							currentQuestionIndex === 0 ? ' hidden' : ''
						}`}
						onClick={this.prevQuestion}
					>
						<svg
							className="w1"
							data-icon="chevronLeft"
							viewBox="0 0 32 32"
							style={{ fill: 'currentcolor' }}
						>
							<title>chevronLeft icon</title>
							<path d="M20 1 L24 5 L14 16 L24 27 L20 31 L6 16 z" />
						</svg>
						<span className="pl1">Previous</span>
					</a>
					<a
						href="/"
						className="f5 no-underline black bg-animate hover-bg-black hover-white inline-flex items-center pa3 ba border-box"
						onClick={this.startOver}
					>
						<span className="pr1">Start over</span>
					</a>
					<a
						href="#next"
						className="f5 no-underline black bg-animate hover-bg-black hover-white inline-flex items-center pa3 ba border-box"
						onClick={
							currentQuestionIndex === questions.length - 1 ? this.goToSummary : this.nextQuestion
						}
					>
						<span className="pr1">
							{currentQuestionIndex === questions.length - 1 ? 'Summary' : 'Next'}
						</span>
						<svg
							className="w1"
							data-icon="chevronRight"
							viewBox="0 0 32 32"
							style={{ fill: 'currentcolor' }}
						>
							<title>chevronRight icon</title>
							<path d="M12 1 L26 16 L12 31 L8 27 L18 16 L8 5 z" />
						</svg>
					</a>
				</footer>
			</div>
		);
	}
}

const QUESTIONS_QUERY = gql`
	query QuestionsQuery {
		questions {
			id
		}
	}
`;

export default graphql(QUESTIONS_QUERY, { name: 'questionsQuery' })(Game);
