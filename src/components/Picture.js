import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Picture extends Component {
	state = { timesReloaded: 0 };

	static propTypes = {
		url: PropTypes.string.isRequired,
		clue: PropTypes.string,
		attributionName: PropTypes.string.isRequired,
		attributionLink: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		revealClue: PropTypes.func.isRequired,
	};

	getNewPicture = e => {
		e.preventDefault();
		const { type, getNewPicture } = this.props;

		getNewPicture(type);
		this.setState({ timesReloaded: this.state.timesReloaded + 1 });
	};

	revealClue = e => {
		e.preventDefault();
		const { type, revealClue } = this.props;

		revealClue(type);
	};

	render() {
		const { url, clue, attributionName, attributionLink } = this.props;
		const showRevealClueButton = this.state.timesReloaded >= 3;

		return (
			<div className="pr3-ns mb4 mb0-ns w-100 w-45-ns">
				<img src={url} className="db" alt="Clue 1" />
				<span className="f6 dib mt2 fl gray">
					Photo by{' '}
					<a
						href={`${attributionLink}?utm_source=Pictoword&utm_medium=referral`}
						target="_blank"
						rel="noopener noreferrer"
					>
						{attributionName}
					</a>{' '}
					on{' '}
					<a
						href="https://unsplash.com/?utm_source=Pictoword&utm_medium=referral"
						target="_blank"
						rel="noopener noreferrer"
					>
						Unsplash
					</a>
				</span>
				{clue ? (
					<p className="f6 dib mt2 mb0 fr">{clue}</p>
				) : (
					<a
						href="#reloadPic"
						className="link f6 dib mt2 fr"
						onClick={showRevealClueButton ? this.revealClue : this.getNewPicture}
					>
						{showRevealClueButton ? 'Reveal clue' : 'Reload'}
					</a>
				)}
			</div>
		);
	}
}

export default Picture;
