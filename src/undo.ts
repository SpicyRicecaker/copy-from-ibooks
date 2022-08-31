import { LocalStorage } from '@raycast/api';
import { showHUD } from '@raycast/api';
import { Data, prevState, State, stringFromState } from './index';

// simply removes the previouds added field and adds a toast in gui
export default async (): Promise<void> => {
  const dataString = await LocalStorage.getItem<string>('data');

  if (dataString === undefined) {
    return;
  }

  const data: Data = JSON.parse(dataString);

  let outMsg = '';
  if (data.state === State.Example) {
    outMsg = 'Undid nothing';
  } else {
    outMsg = `removed ${stringFromState(data.state)}, need ${stringFromState(prevState(data.state))}`;
    data.card[stringFromState(data.state)]
    data.state--;
  }

  await LocalStorage.setItem('data', JSON.stringify(data));

  showHUD(outMsg);
}