import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest'
import { GetObjectCommand, type GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3'
import { mockClient } from 'aws-sdk-client-mock'
import 'aws-sdk-client-mock-jest'
import path from 'path'
import 'dotenv/config'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const s3Mock = mockClient(S3Client)

vi.mock('fs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('fs')>()),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(() => false)
}))

const mockWriteFileSync = fs.writeFileSync as MockedFunction<
  typeof fs.writeFileSync
>

async function fetchWordListValues() {
  s3Mock.on(GetObjectCommand).resolves({
    Body: {
      transformToString: () => Promise.resolve(JSON.stringify({ data: ['tests', 'words', 'texts'] }))
    }
  } as any as GetObjectCommandOutput)

  const fetchWordList = await import('./fetchWordList')

  await fetchWordList.default()
}

beforeEach(async () => {
  s3Mock.reset()
  vi.resetAllMocks()
  vi.spyOn(process, 'cwd').mockReturnValue('/fake/directory')
})

afterEach(() => {
  s3Mock.restore()
  vi.restoreAllMocks()
})

describe('S3 fetch and save', () => {
  it('fetches from S3 and saves the file locally', async () => {
    await fetchWordListValues()

    expect(s3Mock).toHaveReceivedCommand(GetObjectCommand)

    const expectedPath = path.join(process.cwd(), 'src', process.env.WORD_LIST_FILE_NAME)
    expect(mockWriteFileSync).toHaveBeenCalledWith(expectedPath, JSON.stringify({ data: ['tests', 'words', 'texts'] }))
  })

  it('handles errors from S3', async () => {
    s3Mock.on(GetObjectCommand).rejects(new Error('Simulated S3 error'))

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
    })

    const fetchWordList = await import('./fetchWordList')

    await fetchWordList.default()

    // Verify that the error handling code was triggered
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching from storage:', expect.any(Error))

    // Clean up the spy to avoid memory leaks and unintended side effects in other tests
    consoleErrorSpy.mockRestore()
  })
})

describe('fetchWordList behavior based on process.argv[1]', () => {
  let originalArgv: string[]

  beforeEach(() => {
    originalArgv = [...process.argv]
    process.argv[1] = fileURLToPath(import.meta.url)
  })

  afterEach(() => {
    process.argv = originalArgv
  })

  it('should have the same output when called directly', async () => {
    await fetchWordListValues()

    expect(s3Mock).toHaveReceivedCommand(GetObjectCommand)

    const expectedPath = path.join(process.cwd(), 'src', process.env.WORD_LIST_FILE_NAME)
    expect(mockWriteFileSync).toHaveBeenCalledWith(expectedPath, JSON.stringify({ data: ['tests', 'words', 'texts'] }))
  })

  it('should handle errors when called directly', async () => {
    s3Mock.on(GetObjectCommand).rejects(new Error('Simulated S3 error'))

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
    })

    const fetchWordList = await import('./fetchWordList')

    await fetchWordList.default()

    expect(s3Mock).toHaveReceivedCommand(GetObjectCommand)

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching from storage:', expect.any(Error))

    consoleErrorSpy.mockRestore()
  })
})
