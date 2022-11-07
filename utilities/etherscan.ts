import { run } from 'hardhat'

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

/**
 * Verifies a contract on etherscan
 * @param address - Address of the contract to verify
 * @param constructorArguments - Arguments initially provided to the contract at deploy time
 */
export async function verify(
    address: string,
    constructorArguments: string[]
): Promise<void> {
    console.log('Verifying contract...')

    if (ETHERSCAN_API_KEY === undefined) {
        throw new Error('Missing ETHERSCAN_API_KEY environment variable')
    }

    try {
        await run('verify:verify', {
            address,
            constructorArguments
        })
    } catch (error: unknown) {
        if (
            error instanceof Error &&
            error.message.toLowerCase().includes('already verified')
        ) {
            console.log('Already verified')
        } else {
            console.log(error)
        }
    }
}
