import 'dotenv/config'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

async function fetchWordList() {
  const client = new S3Client({
    region: process.env.AWS_REGION
  })

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: process.env.WORD_LIST_FILE_NAME
  })

  if (!fs.existsSync(path.join(process.cwd(), process.env.WORD_LIST_FILE_NAME))) {
    try {
      const response = await client.send(command)
      const str = await response.Body?.transformToString()
      const outputPath = path.join(process.cwd(), process.env.WORD_LIST_FILE_NAME)
      fs.writeFileSync(outputPath, str)
      console.log(`File fetched and saved to ${outputPath}`)
    } catch (err) {
      console.error('Error fetching from storage:', err)
    }
  }
}

const isDirectCall = process.argv[1] === fileURLToPath(import.meta.url)

if (isDirectCall) {
  fetchWordList().catch(console.error)
}

export default fetchWordList
