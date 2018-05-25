import React, { Component } from 'react';
import { reset, getAllQuestionStatuses } from '../data';

class Home extends Component {
	startOver = e => {
		e.preventDefault();
		reset();
		this.props.history.push('/');
	};

	render() {
		const questionStatuses = getAllQuestionStatuses();

		if (
			!questionStatuses ||
			Object.values(questionStatuses).filter(qs => qs.status !== 'unanswered').length === 0
		) {
			return <p className="tc">Play the game first to see the summary</p>;
		}

		const correctAnswers = Object.values(questionStatuses).filter(qs => qs.status === 'correct')
			.length;
		const incorrectAnswers = Object.values(questionStatuses).filter(qs => qs.status === 'incorrect')
			.length;
		const unanswered = Object.values(questionStatuses).filter(qs => qs.status === 'unanswered')
			.length;

		return (
			<div>
				<article className="pa3 pa5-ns">
					<h1>Summary</h1>
					<dl className="dib mr5">
						<dd className="f6 f5-ns b ml0">Correct</dd>
						<dd className="f3 f2-ns b ml0">{correctAnswers}</dd>
					</dl>
					<dl className="dib mr5">
						<dd className="f6 f5-ns b ml0">Incorrect</dd>
						<dd className="f3 f2-ns b ml0">{incorrectAnswers}</dd>
					</dl>
					<dl className="dib mr5">
						<dd className="f6 f5-ns b ml0">Unanswered</dd>
						<dd className="f3 f2-ns b ml0">{unanswered}</dd>
					</dl>
					<dl className="dib mr5">
						<dd className="f6 f5-ns b ml0">Score</dd>
						<dd className="f3 f2-ns b ml0">
							{correctAnswers} / {Object.values(questionStatuses).length}
						</dd>
					</dl>
				</article>
				<footer className="flex pa1">
					<a
						href="/"
						className="f5 no-underline black bg-animate hover-bg-black hover-white inline-flex items-center pa3 center ba border-box"
						onClick={this.startOver}
					>
						Home
					</a>
				</footer>
			</div>
		);
	}
}

export default Home;
