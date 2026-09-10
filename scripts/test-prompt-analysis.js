const { evaluatePrompts } = require('../src/lib/claude');

async function test() {
  const samplePrompts = [
    "what would be best fo rme? supabse or neon?",
    "now like how it will work tell me this. like why i am givig ANTHROPIC_API_KEY in my env. it will connct by user right. so what happing",
    "okay then i want to use gemni its cheap right AIzaSyD... check its workign or not",
    "generete question is not updating questions. and in my whole site there shoudl nto hard any. it shoud come real test it very carefully."
  ];

  console.log('Asking Gemini 3.6 Flash to analyze your real conversation prompts...\n');
  const result = await evaluatePrompts(samplePrompts);
  console.log(JSON.stringify(result, null, 2));
}

test();
