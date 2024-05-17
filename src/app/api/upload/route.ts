import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { S3Client } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { env } from "@/env";

export async function POST(request: Request) {
  const { contentType } = await request.json()

  const id = uuidv4()
  try {
    const client = new S3Client({
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
      },
      region: env.AWS_REGION,
    })
    const { url, fields } = await createPresignedPost(client, {
      Bucket: env.AWS_BUCKET_NAME,
      Key: id,
      Conditions: [
        ['content-length-range', 0, 10485760], // up to 10 MB
        ['starts-with', '$Content-Type', contentType],
      ],
      Fields: {
        acl: 'public-read',
        'Content-Type': contentType,
      },
      Expires: 600, // Seconds before the presigned post expires. 3600 by default.
    })

    return Response.json({ url, fields, id })
  } catch (error) {
    // @ts-ignore
    return Response.json({ error: error.message })
  }
}
