import { closeMainWindow } from '@raycast/api'
import { execSync } from 'child_process'
import { showHUD } from '@raycast/api'

export interface CommandError {
  stderr: string
}

export const ripbk = `${process.env.HOME as string}/.cargo/bin/ripbk`

export default async (): Promise<void> => {
  await closeMainWindow()
  try {
    execSync('command-c')
    execSync(`${ripbk} --add cloze`)
  } catch (e: unknown) {
    showHUD(`E: ${(e as CommandError).stderr}`)
  }
}
