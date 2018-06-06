require('es6-promise').polyfill();
require('isomorphic-fetch');
const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const DataLoader = require('dataloader');
const { default: Unsplash, toJson } = require('unsplash-js');
const shuffle = require('lodash.shuffle');

const unsplash = new Unsplash({
	applicationId: '5f5bd1a9b6a187ca18755b58679030afe76cf92130a1a3f020d9d9bf23d0425f',
	secret: '77e1e3c32b88bfd9f99502b1ab23254cd555960769551dd97c6b102e52deed6e',
});
const unsplashLoader = new DataLoader(
	async queries => {
		const values = await Promise.all(
			queries.map(query =>
				unsplash.photos
					.getRandomPhoto({ query })
					.then(toJson)
					.catch(e => ({})),
			),
		);

		return values;
	},
	{
		cache: false,
	},
);

const getRandomCharacters = count => {
	const result = [];
	const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz';

	for (let i = 0; i < count; i++) {
		result.push(possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length)));
	}

	return result;
};

const resolvers = {
	Query: {
		async questions(parent, args, ctx, info) {
			return await ctx.db.query.questions({});
		},
		async question(parent, { id }, ctx, info) {
			const question = await ctx.db.query.question({ where: { id } });

			if (!question) {
				throw new Error('Question not found');
			}

			return question;
		},
		checkAnswer(parent, { id, answer }, ctx) {
			return ctx.db.exists.Question({
				id,
				answer,
			});
		},
		async getNewPicture(parent, { id, type }, ctx) {
			const question = await ctx.db.query.question({ where: { id } }, `{ ${type} }`);

			if (!question) {
				throw new Error('Question not found');
			}

			return unsplashLoader.load(question[type]);
		},
		async revealClue(parent, { id, type }, ctx) {
			const question = await ctx.db.query.question({ where: { id } }, `{ ${type} }`);

			if (!question) {
				throw new Error('Question not found');
			}

			return question[type];
		},
	},
	Question: {
		answerLength: parent => parent.answer.length,
		optionKeys: parent => {
			const answerKeys = parent.answer.split('');
			const remainingKeys = getRandomCharacters(14 - answerKeys.length);

			return shuffle([...answerKeys, ...remainingKeys]);
		},
		picture1: parent => {
			return unsplashLoader.load(parent.picture1);
		},
		picture2: parent => {
			return unsplashLoader.load(parent.picture2);
		},
	},
	Picture: {
		url: photo => {
			return photo.urls
				? photo.urls.regular
				: 'http://via.placeholder.com/470x315?text=Unsplash+API+Limit+Reached';
		},
		attributionName: photo => {
			return photo.user ? photo.user.name : 'Unsplash API Limit Reached';
		},
		attributionLink: photo => {
			return photo.user ? photo.user.links.html : 'https://unsplash.com';
		},
	},
};

const server = new GraphQLServer({
	typeDefs: './src/schema.graphql',
	resolvers,
	context: req => ({
		...req,
		db: new Prisma({
			typeDefs: 'src/generated/prisma.graphql', // the auto-generated GraphQL schema of the Prisma API
			endpoint: 'https://eu1.prisma.sh/public-prismcat-86/pictoword-server/dev', // the endpoint of the Prisma API
			debug: false, // log all GraphQL queries & mutations sent to the Prisma API
			// secret: 'mysecret123', // only needed if specified in `database/prisma.yml`
		}),
	}),
});

server.start(() => console.log('Server is running on http://localhost:4000'));
