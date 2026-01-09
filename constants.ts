import { Novel, CharacterTest } from './types';

export const MOCK_NOVELS: Novel[] = [
  { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', chunkCount: 482, status: 'processed' },
  { id: '2', title: 'Pride and Prejudice', author: 'Jane Austen', chunkCount: 1250, status: 'processed' },
  { id: '3', title: '1984', author: 'George Orwell', chunkCount: 890, status: 'pending' },
];

export const MOCK_TESTS: CharacterTest[] = [
  {
    id: 't1',
    bookName: 'The Great Gatsby',
    character: 'Jay Gatsby',
    claim: 'Gatsby inherited all his money from his wealthy parents in the Middle West.',
    retrievedContext: [
      "\"I am the son of some wealthy people in the Middle West—all dead now.\" \"Where in the Middle West?\" \"San Francisco.\"",
      "His parents were shiftless and unsuccessful farm people—his imagination had never really accepted them as his parents at all.",
      "James Gatz—that was really, or at least legally, his name. He had changed it at the age of seventeen and at the specific moment that witnessed the beginning of his career."
    ],
    prediction: undefined,
    rationale: undefined
  },
  {
    id: 't2',
    bookName: 'The Great Gatsby',
    character: 'Daisy Buchanan',
    claim: 'Daisy waited faithfully for Gatsby throughout the war and never loved anyone else.',
    retrievedContext: [
      "She wanted her life shaped now, immediately—and the decision must be made by some force—of love, of money, of unquestionable practicality—that was close at hand.",
      "That force took shape in the middle of spring with the arrival of Tom Buchanan. There was a wholesome bulkiness about his person and his position, and Daisy was flattered.",
      "\"Even alone I can't say I never loved Tom,\" she admitted in a pitiful voice. \"It wouldn't be true.\""
    ],
    prediction: undefined,
    rationale: undefined
  },
  {
    id: 't3',
    bookName: 'Pride and Prejudice',
    character: 'Mr. Darcy',
    claim: 'Mr. Darcy immediately found Elizabeth Bennet to be the most beautiful woman he had ever seen upon their first meeting.',
    retrievedContext: [
      "\"She is tolerable, but not handsome enough to tempt me; I am in no humour at present to give consequence to young ladies who are slighted by other men.\"",
      "Mr. Darcy walked off; and Elizabeth remained with no very cordial feelings toward him.",
      "He looked for a moment at Elizabeth, till catching her eye, he withdrew his own and coldly said she was tolerable."
    ],
    prediction: undefined,
    rationale: undefined
  }
];