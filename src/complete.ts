import { showHUD } from '@raycast/api';
import { execSync } from 'child_process'
import { CommandError, ripbk } from '.';

// completely removes the previouds added field and adds a toast in gui
export default async (): Promise<void> => {
  try {
    execSync('command-c')
    execSync(`${ripbk} --complete`)
  } catch (e: unknown) {
    showHUD(`E: ${(e as CommandError).stderr}`)
  }
}