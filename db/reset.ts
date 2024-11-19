import 'dotenv/config'

import readline from 'readline'
import pgtools from 'pgtools'

const DATABASE_NAME = process.env.DATABASE_NAME ?? 'demo-db'

// When used by createdb / dropdb the database name at the end of DATABASE_URL
// is ignored and replaced with the default postgres database
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgres://localhost:5432/demo-db'

if (!DATABASE_URL) {
  throw new Error('No url for Scripting SQL')
}

console.log('Database URL is:', DATABASE_URL)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function askForPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question('Do you want to continue? (y/n): ', (answer) => {
      resolve(answer.toLowerCase() === 'y')
    })
  })
}

async function dropDatabase() {
  await pgtools.dropdb(DATABASE_URL, DATABASE_NAME)
}

async function createDatabase() {
  await pgtools.createdb(DATABASE_URL, DATABASE_NAME)
}

function handleDropErrors(err: { message: string | string[] }) {
  if (err.message.indexOf(`does not exist`) === -1) {
    throw err
  } else {
    console.log('Cold Start Detected! Database does not exist...')
    createDatabase().then(() => {
      console.log('Database created!')
      rl.close()
    })
  }
}

async function main() {
  if (!DATABASE_URL.includes('localhost')) {
    console.warn(
      'Warning: Database URL is not set to localhost. Be cautious when resetting non-local databases.'
    )
    const shouldContinue = await askForPermission()
    if (!shouldContinue) {
      console.log('Operation cancelled.')
      rl.close()
      return
    }
  }

  try {
    await dropDatabase()
    console.log('Database dropped!')
    await createDatabase()
    console.log('Database created!')
  } catch (err) {
    handleDropErrors(err as { message: string | string[] })
  } finally {
    rl.close()
  }
}

main()
