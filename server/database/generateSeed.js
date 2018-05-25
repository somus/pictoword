const fs = require('fs');
const questions = require('./pictoword.json');

const createQuestion = ({ picture1, picture2, answer }) => {
	const alias = `question_${Math.random()
		.toString(36)
		.slice(2)}`;

	return `
    ${alias}: createQuestion(data: { picture1: "${picture1}", picture2: "${picture2}", answer: "${answer}" }) {
      id
    }
  `;
};

const createQuestions = mutations => {
	const joinedMutations = mutations.join('\n');

	return `
  mutation createQuestions {
    ${joinedMutations}
  }
  `;
};

const mutations = questions.map(question => createQuestion(question));
const seedContent = createQuestions(mutations);

fs.writeFileSync('./database/seed.graphql', seedContent);
