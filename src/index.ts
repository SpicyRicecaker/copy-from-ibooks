import { closeMainWindow } from '@raycast/api';
import { execSync } from 'child_process';
import { showHUD } from '@raycast/api';
import { LocalStorage } from '@raycast/api';
import fetch from 'node-fetch';

interface CommandError {
  stderr: string;
}

// This could also be used for japanese as well, but we need to configure an extra hotkey to allow for switching states
export enum State {
  Example = 0,
  Word = 1,
  Reading = 2,
  Meaning = 3
}

export const nextState = (state: State): State => {
  return (state + 1) % 4
}

export const prevState = (state: State): State => {
  return (state - 1) % 4
}

export const stringFromState = (state: State): string => {
  switch (state) {
    case State.Example: {
      return 'example';
    }
    case State.Word: {
      return 'word';
    }
    case State.Reading: {
      return 'reading';
    }
    case State.Meaning: {
      return 'meaning';
    }
    default: {
      // should be unreachable
      return '';
    }
  }
}

export interface Card {
  [meaning: string]: string,
  word: string,
  reading: string,
  example: string
}

export interface Data {
  state: State,
  // actually, because there's an anki connect option to pass data directly to the card, there shouldn't be a need to undo the creation of a card, because we'll never actually create the card through anki connect
  // lastCreatedCard: number | null,
  card: Card,
}

const initData = (): Data => ({ state: State.Example, card: { meaning: '', word: '', reading: '', example: '' } })

const ankiURI = "http://localhost:8765";

export default async (): Promise<void> => {
  await closeMainWindow();

  // load data from localstorage https://developers.raycast.com/api-reference/storage
  const dataString = await LocalStorage.getItem<string>('data');

  const data: Data = ((): Data => {
    if (dataString) {
      // if data exists, create something i guess?
      return JSON.parse(dataString);
    } else {
      return initData();
    }
  })();

  try {
    execSync('command-c');
    // change raw copy ibooks to output to stdout
    const copiedText = execSync('/Users/oliver/git/raw_copy_ibooks/target/release/raw_copy_ibooks').toString();

    switch (data.state) {
      case State.Example:
      case State.Word:
      case State.Reading: {
        data.card[stringFromState(data.state)] = copiedText;

        showHUD(`added ${stringFromState(data.state)}. need ${stringFromState(nextState(data.state))}`);
        break;
      }
      case State.Meaning: {
        await fetch(ankiURI, {
          method: 'POST', body: JSON.stringify({
            action: "guiAddCards",
            version: 6,
            params: {
              note: {
                deckName: "misc",
                modelName: "Basic",
                fields: {
                  // we're definitely not doing this as efficiently as we can lol
                  Front: copiedText,
                  Back: `${data.card.word}<br>${data.card.reading}<br><br>${data.card.example}`
                },
                tags: [
                  "book"
                ],
              }
            }
          })
        });

        data.card = {
          meaning: '',
          word: '',
          reading: '',
          example: '',
        };
        break;
      }
      // unreachable
      default: {
        break;
      }
    }

    data.state = nextState(data.state);
    LocalStorage.setItem('data', JSON.stringify(data));
  } catch (e: unknown) {
    showHUD(`E: ${(e as CommandError).stderr}`);
  }
}
