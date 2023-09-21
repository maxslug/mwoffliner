import * as mwoffliner from '../../src/mwoffliner.lib.js'
import { execa } from 'execa'
import rimraf from 'rimraf'
import { zimcheckAvailable, zimcheck } from '../util.js'
import 'dotenv/config.js'
import { jest } from '@jest/globals'
import { zimdumpAvailable, zimdump } from '../util.js'

jest.setTimeout(200000)

describe('bm', () => {
  const now = new Date()
  const testId = `mwo-test-${+now}`

  const parameters = {
    mwUrl: 'https://bm.wikipedia.org',
    adminEmail: 'test@kiwix.org',
    outputDirectory: testId,
    redis: process.env.REDIS,
    format: ['nopic'],
    forceRender: 'WikimediaDesktop',
  }

  test('Simple articleList', async () => {
    await execa('redis-cli flushall', { shell: true })

    const outFiles = await mwoffliner.execute(parameters)

    // Created 1 output
    expect(outFiles).toHaveLength(1)

    for (const dump of outFiles) {
      if (dump.nopic) {
        // nopic has enough files
        expect(dump.status.files.success).toBeGreaterThan(14)
        // nopic has enough redirects
        expect(dump.status.redirects.written).toBeGreaterThan(170)
        // nopic has enough articles
        expect(dump.status.articles.success).toBeGreaterThan(700)
      }
    }

    if (await zimcheckAvailable()) {
      await expect(zimcheck(outFiles[0].outFile)).resolves.not.toThrowError()
    } else {
      console.log('Zimcheck not installed, skipping test')
    }

    if (await zimdumpAvailable()) {
      const discussionArticlesStr = await zimdump(`list --ns A/Discussion ${outFiles[0].outFile}`)
      // Articles with "Discussion" namespace should be only with option addNamespaces: 1
      expect(discussionArticlesStr.length).toBe(0)
    } else {
      console.log('Zimdump not installed, skipping test')
    }

    // TODO: clear test dir
    rimraf.sync(`./${testId}`)

    const redisScan = await execa('redis-cli --scan', { shell: true })
    // Redis has been cleared
    expect(redisScan.stdout).toEqual('')
  })

  test('Articles with "Discussion" namespace', async () => {
    await execa('redis-cli flushall', { shell: true })

    const outFiles = await mwoffliner.execute({ ...parameters, addNamespaces: 1 })
    // Created 1 output
    expect(outFiles).toHaveLength(1)

    if (await zimdumpAvailable()) {
      const discussionArticlesStr = await zimdump(`list --ns A/Discussion ${outFiles[0].outFile}`)
      const discussionArticlesList = discussionArticlesStr.match(/Discussion:/g)
      expect(discussionArticlesList.length).toBeGreaterThan(30)
    } else {
      console.log('Zimdump not installed, skipping test')
    }

    // TODO: clear test dir
    rimraf.sync(`./${testId}`)

    const redisScan = await execa('redis-cli --scan', { shell: true })
    // Redis has been cleared
    expect(redisScan.stdout).toEqual('')
  })
})
