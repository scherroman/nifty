import { deployments } from 'hardhat'

import { updateFrontEnd } from '../utilities/updateFrontEnd'

const SHOULD_UPDATE_FRONT_END = process.env.SHOULD_UPDATE_FRONT_END

async function deploy(): Promise<void> {
    if (SHOULD_UPDATE_FRONT_END) {
        deployments.log('Updating front end...')
        await updateFrontEnd()
    }
}

deploy.tags = ['all', 'frontend']

export default deploy
