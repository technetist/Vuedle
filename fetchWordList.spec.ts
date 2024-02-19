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
    // Mock the S3 client to return a stream-like object
    s3Mock.on(GetObjectCommand).resolves({
      Body: {
        // Simulate a stream-like object with a custom transformToString function
        transformToString: () => Promise.resolve(JSON.stringify({ data: ['tests', 'words', 'texts'] }))
      }
    } as any as GetObjectCommandOutput)

    const fetchWordList = await import('./fetchWordList')

    await fetchWordList.default()

    // Verify the S3 client was called with the correct parameters
    expect(s3Mock).toHaveReceivedCommand(GetObjectCommand)

    // Verify fs.writeFileSync was called correctly
    const expectedPath = path.join(process.cwd(), process.env.WORD_LIST_FILE_NAME)
    expect(mockWriteFileSync).toHaveBeenCalledWith(expectedPath, JSON.stringify({ data: ['tests', 'words', 'texts'] }))
  })

  it('handles errors from S3', async () => {
    // Mock the S3 client to throw an error
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
    // Store the original process.argv
    originalArgv = [...process.argv]
    // Mock process.argv[1] as if it's the script being executed
    process.argv[1] = fileURLToPath(import.meta.url)
  })

  afterEach(() => {
    // Restore the original process.argv after each test
    process.argv = originalArgv
  })

  it('should behave differently when called directly', async () => {
    s3Mock.on(GetObjectCommand).resolves({
      Body: {
        // Simulate a stream-like object with a custom transformToString function
        transformToString: () => Promise.resolve(JSON.stringify({ data: ['tests', 'words', 'texts'] }))
      }
    } as any as GetObjectCommandOutput)

    // Call the function or script logic you want to test
    const fetchWordList = await import('./fetchWordList')

    await fetchWordList.default()

    // Verify the S3 client was called with the correct parameters
    expect(s3Mock).toHaveReceivedCommand(GetObjectCommand)

    // Verify fs.writeFileSync was called correctly
    const expectedPath = path.join(process.cwd(), process.env.WORD_LIST_FILE_NAME)
    expect(mockWriteFileSync).toHaveBeenCalledWith(expectedPath, JSON.stringify({ data: ['tests', 'words', 'texts'] }))
  })

  it('should handle errors when called directly', async () => {
    s3Mock.on(GetObjectCommand).rejects(new Error('Simulated S3 error'))

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
    })

    // Call the function or script logic you want to test
    const fetchWordList = await import('./fetchWordList')

    await fetchWordList.default()

    // Verify the S3 client was called with the correct parameters
    expect(s3Mock).toHaveReceivedCommand(GetObjectCommand)

    // Verify that the error handling code was triggered
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching from storage:', expect.any(Error))

    // Clean up the spy to avoid memory leaks and unintended side effects in other tests
    consoleErrorSpy.mockRestore()
  })
})
