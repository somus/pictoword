import React, { Component } from 'react';

class Picture extends Component {
	state = { timesReloaded: 0 };

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
		const { url, clue } = this.props;
		const showRevealClueButton = this.state.timesReloaded >= 3;

		return (
			<div className="pr3-ns mb4 mb0-ns w-100 w-45-ns tc">
				<img src={url} className="db" alt="Clue 1" />
				{clue ? (
					<p className="f5 dib mt2 mb0">{clue}</p>
				) : (
					<a
						href="#reloadPic"
						className="link f5 dib mt2"
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
