import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
	return (
		<div>
			<p>
				This is a silly game called Pictoword which I used to play on my mobile. I wanted to do
				something with the unsplash API. So, I made a web version of the game using ReactJS and
				Apollo. All pictures which are required for this game utilizes unsplash's{' '}
				<a
					href="https://unsplash.com/documentation#get-a-random-photo"
					target="_blank"
					rel="noopener noreferrer"
				>
					random API
				</a>.
			</p>

			<p>If you have played this game before, awesome! Just press "Start" to continue.</p>

			<p>
				For those who haven't played this before, Pictoword is game where you read a series of
				pictures that combine to create a word.
			</p>
			<p>
				Since the game uses unsplash's random API, sometimes pictures can be inaccurate. I've tried
				my best to come up a search query which will give pictures as accurate as possible. But, if
				you feel the picture is inaccurate, press the <i>refresh</i> button below each picture to
				get a new one.
			</p>
			<i>
				Please, don't view this in a mobile as it is not optimized for mobile. I'll try to optimize
				it as soon as possible.
			</i>
			<footer className="flex pa1 mt3">
				<Link
					to="/game"
					className="f5 no-underline black bg-animate hover-bg-black hover-white inline-flex items-center pa3 center ba border-box"
				>
					<span className="pr1">Start</span>
				</Link>
			</footer>
		</div>
	);
}

export default Home;
