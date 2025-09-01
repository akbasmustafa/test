import { useState } from 'react';
import './Hangman.css';
import { getRandomWord } from './utils';

const LIVES = 6;

const Hangman = () => {
  const [answer, setAnswer] = useState(getRandomWord());
  const [guess, setGuess] = useState<string[]>(answer.split('').map(() => '_'));
  const [playerInput, setPlayerInput] = useState('');
  const [lives, setLives] = useState(LIVES);
  const [wrongGuesses, setWrongGuesses] = useState(new Set<string>());

  const handlePlayerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const letter = e.target.value.toUpperCase();
    const alphabetRegex = /^[A-Z]$/;
    if (alphabetRegex.test(letter) || letter === '') {
      setPlayerInput(letter);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && playerInput) {
      if (
        playerInput === '' ||
        wrongGuesses.has(playerInput) ||
        guess.includes(playerInput)
      )
        return;

      if (answer.includes(playerInput)) {
        setGuess((prev) =>
          answer
            .split('')
            .map((letter, index) =>
              letter === playerInput ? letter : prev[index]
            )
        );
      } else {
        setLives(lives - 1);
        setWrongGuesses((prev) => new Set(prev).add(playerInput));
      }

      setPlayerInput('');
    }
  };

  const handleRestart = () => {
    const newWord = getRandomWord();
    setAnswer(newWord);
    setGuess(Array(newWord.length).fill('_'));
    setLives(LIVES);
    setWrongGuesses(new Set<string>());
    setPlayerInput('');
  };

  return (
    <div>
      <h1>Hangman</h1>
      <h2
        data-testid='guess'
        className='guess'
        role='group'
        aria-label='Current guessed letters'
      >
        {guess.map((letter, index) => (
          <span
            key={index}
            className='letter'
            aria-label={letter === '_' ? 'blank' : letter}
          >
            {letter}
          </span>
        ))}
      </h2>
      <h3 className='lives' aria-live='polite'>
        Lives: {lives}
      </h3>
      <p className='wrong-guesses' aria-live='polite'>
        Wrong Guesses: {Array.from(wrongGuesses).join(', ')}
      </p>
      <div className='player-input-section'>
        <label htmlFor='player-input'>Guess a letter</label>
        <input
          id='player-input'
          type='text'
          maxLength={1}
          value={playerInput}
          onChange={handlePlayerInputChange}
          onKeyDown={handleKeyDown}
          aria-label='Input a letter to guess and press enter'
        />
      </div>
      {(lives === 0 || !guess.includes('_')) && (
        <div className='game-over' aria-live='assertive'>
          {lives === 0 ? (
            <h2 className='end-message'>You lost! The word was: {answer}</h2>
          ) : (
            <h2 className='end-message'>
              Congratulations! You guessed the word!
            </h2>
          )}
          <button autoFocus onClick={handleRestart}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Hangman;
