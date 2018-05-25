import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Header from './Header';
import Home from './Home';
import Game from './Game';
import Summary from './Summary';

function App() {
	return (
		<div className="center w70 black-80">
			<Header />
			<div className="ph3 pv1">
				<Switch>
					<Route exact path="/" component={Home} />
					<Route exact path="/game" component={Game} />
					<Route exact path="/summary" component={Summary} />
				</Switch>
			</div>
		</div>
	);
}

export default App;
