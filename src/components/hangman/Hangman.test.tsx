import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import Hangman from './Hangman';

const mockWord = 'REACT';
vi.mock('./utils', () => ({
  getRandomWord: vi.fn(() => mockWord),
}));

describe('Hangman', () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    render(<Hangman />);
    user = userEvent.setup();
  });

  it('renders correctly with title "Hangman"', () => {
    expect(screen.getByText(/Hangman/i)).toBeInTheDocument();
  });

  it('should display the correct number of underscores for the word to guess initially', () => {
    expect(screen.queryAllByText('_')).toHaveLength(mockWord.length);
  });

  it('should display the correct letters when guessed and clear the input', async () => {
    const input = screen.getByLabelText(/Guess a letter/i);

    await user.type(input, 'R{enter}');

    const guess = screen.getByTestId('guess');
    const letters = Array.from(guess.querySelectorAll('span'))
      .map((span) => span.textContent)
      .filter((letter) => letter?.trim() !== '_');
    expect(letters).toHaveLength(1);
    expect(letters).toContain('R');
    expect(input).toHaveValue('');
  });

  it('should decrement lives and track wrong guesses', async () => {
    const input = screen.getByLabelText(/Guess a letter/i);

    await user.type(input, 'Z{Enter}');

    expect(screen.getByText(/Lives: 5/)).toBeInTheDocument();
    expect(screen.getByText(/Wrong Guesses: Z/)).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('should not decrement lives or add duplicate wrong guesses', async () => {
    const input = screen.getByLabelText(/Guess a letter/i);

    await user.type(input, 'Z{Enter}');
    await user.type(input, 'Z{Enter}');

    expect(screen.getByText(/Lives: 5/)).toBeInTheDocument();
    expect(screen.getByText(/Wrong Guesses: Z/)).toBeInTheDocument();
  });

  it('should not allow guessing the same correct letter again', async () => {
    const input = screen.getByLabelText(/Guess a letter/i);

    await user.type(input, 'R{Enter}');
    await user.type(input, 'R{Enter}');

    expect(screen.getByText(/Lives: 6/)).toBeInTheDocument(); // lives unchanged
    const guess = screen.getByTestId('guess');
    const letters = Array.from(guess.querySelectorAll('span'))
      .map((span) => span.textContent)
      .filter((letter) => letter?.trim() !== '_');
    expect(letters).toHaveLength(1);
  });

  it('should display win message when all letters guessed', async () => {
    const input = screen.getByLabelText(/Guess a letter/i);
    const letters = ['R', 'E', 'A', 'C', 'T'];

    for (const letter of letters) {
      await user.type(input, `${letter}{Enter}`);
    }

    expect(
      await screen.findByText((content) => /congratulation/i.test(content))
    ).toBeInTheDocument();
    // expect(
    //   screen.getByRole('button', { name: /Play Again/i })
    // ).toBeInTheDocument();
  });

  it.skip('should display lose message when lives reach 0', async () => {
    const input = screen.getByLabelText(/Guess a letter/i);
    const wrongLetters = ['B', 'D', 'F', 'G', 'H', 'I'];

    for (const letter of wrongLetters) {
      await user.type(input, `${letter}{Enter}`);
    }

    expect(
      screen.getByText(/You lost! The word was: REACT/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Play Again/i })
    ).toBeInTheDocument();
  });

  it.skip('should restart the game when Play Again is clicked', async () => {
    const input = screen.getByLabelText(/Guess a letter/i);

    // Make a wrong guess to change state
    await user.type(input, 'Z{Enter}');

    const playAgainButton = screen.getByRole('button', { name: /Play Again/i });
    await user.click(playAgainButton);

    // Should reset lives and wrong guesses
    expect(screen.getByText(/Lives: 6/)).toBeInTheDocument();
    expect(screen.getByText(/Wrong Guesses:/)).toBeInTheDocument();
    expect(screen.queryAllByText('_')).toHaveLength(mockWord.length);
  });
});
