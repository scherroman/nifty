import { updateFrontEnd } from '../utilities/updateFrontEnd'

async function main(): Promise<void> {
    await updateFrontEnd()
}

main().catch((error) => {
    console.error(error)
    throw error
})
