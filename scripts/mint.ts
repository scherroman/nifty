import { mint } from '../utilities/contract'

async function main(): Promise<void> {
    await mint()
}

main().catch((error) => {
    console.error(error)
    throw error
})
