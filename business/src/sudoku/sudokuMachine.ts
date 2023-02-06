import { createMachine } from "xstate";
import { Cells } from "./types";

type SudokuContext = {
  cells: Cells;
  highlighted: Set<string>;
  prefilled: Set<string>;
  current: string;
  timePassed: number;
};

type DirectionValues = ["up", "down", "left", "right"];
type Direction = DirectionValues[number];

type SudokuEvent =
  | { type: "STARTGAME" }
  | { type: "NEWGAME" }
  | { type: "WINGAME" }
  | { type: "RESETGAME" }
  | { type: "MOVECURSOR" }
  | { type: "CONTINUE" }
  | { type: "MOVECURSORSUBGRID"; direction: Direction }
  | { type: "TOGGLEMARK"; cell: string; mark: number }
  | { type: "SETCELL"; cell: string; digit: number };

export const sudokuMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGUCuED2BrVBZAhgMYAWAlgHZgB0ADgDb4CeFUAxAOoCSAcgOICCuAKIBtAAwBdRKBoZYpAC6kM5aSAAeiAIwA2ABxUAnMZMBWPWIAsOgOxaANCEaIATFao3TY7zZc3Dpi46lloAvqGOaJg4BCQU1PRMLFQA7viKFApgAE5ESiqsuADyAGpCAMIAqgBKyEW1lQBCvNWcACLiUkggsvL5qt2aCHqWLlQ6YoYAzFpaU4a2U1N6js4IU6Y6VC5e3oZ6hp6bOuGR6Nh4RGSUtAzM5FCp6UrkWbmE-awAKkW8vAAyQlw-GqAGlOmpehkVGohnpgkYpjZLKYkaYbAc5qtEKMpttdpMDkcdDpTKcQFELrFrgk7sk0hlXjk8spyIVShUanVqhDulD+rDEHpPEYUS4piTPHpzCsnIgpmItpYTAsxEFTJZFScIhTzjErvFbkkHk9GW8WQVqkJkEIvgJhLyZHJoQNQENSVtDC4tHotJZkaYtN4ptiEEFDFQ9EsNpqxMsxDYbOTKfq4jdEvdHgyXuaPqzWDavuUhP9-o6es6BYMcV6qAmLOivGj5qGNloqATRlZLHoXNKyTqU5c07TjY8SGBCFgUhRWOUitwvjxKqJJJDK6zBQh-QZrMK3PsdEHzKHNWNvN4XJrjC59lNLMm9cOaVQKBl8HQC18QXbBKuuk6fSbtWCC6HiKrGOYVi2A4crrKYpgeASNjxuYLg7I+0TPoaKQFNwQjsPa-7rkBMIgboBgQQEFjWHYoY7IhOyXgeiYbIE4Q6uQGAQHAahDtS8QkS6W4ALQ6KeNiRtGGrBhYiaYVSBo3G+SgfkJVZujiLitps+KXjofiGKMBlJoOT4CemdIPOpwGaesYjtoYirelY0oWN4pihnMiHRjGskJqZZxYRZo6ZqaObMnmZGAcJIGkmIVCzHYcy+DsEqymsIQJReViubMtgLApqYvrhroVqRZVDKM9FBlJSwyXGcmBbqwVKaFyQTlOM5lfytkaPKypGM5QY9lBHmtkZVAhDBDnLJ4Oj3hxoRAA */
  createMachine<SudokuContext, SudokuEvent>(
    {
      states: {
        initial: {
          on: {
            STARTGAME: "playing",
          },
        },

        playing: {
          entry: ["generateGrid"],

          on: {
            WINGAME: "won",
          },

          states: {
            waitinteraction: {
              on: {
                MOVECURSORSUBGRID: {
                  target: "waitinteraction",
                  internal: true,
                },

                TOGGLEMARK: {
                  target: "waitinteraction",
                  internal: true,
                },

                MOVECURSOR: {
                  target: "waitinteraction",
                  internal: true,
                },

                RESETGAME: "#SudokuMachine.playing",

                SETCELL: "checkwin",
              },
            },

            checkwin: {
              on: {
                CONTINUE: "waitinteraction",
              },
            },
          },

          initial: "checkwin",
        },

        won: {
          on: {
            NEWGAME: "playing",
          },
        },
      },

      initial: "initial",
      id: "SudokuMachine",
    },
    {
      actions: {
        generateGrid: async () => {
          console.log("moi");
        },
      },
    }
  );
