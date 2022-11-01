import { LocalStorage } from '@raycast/api';
import { showHUD } from '@raycast/api';
import { Data, initData, prevState, State, stringFromState } from './index';

// simply removes the previouds added field and adds a toast in gui
export default async (): Promise<void> => {
  await LocalStorage.setItem('data', JSON.stringify(initData()));

  showHUD("successfully reset database");
}