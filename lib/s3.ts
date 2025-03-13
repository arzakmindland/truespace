// Этот файл больше не используется, так как мы интегрируемся с YouTube вместо AWS S3
// Оставлен для справки

/*
import AWS from 'aws-sdk'

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
})

const s3 = new AWS.S3()

export const uploadToS3 = async (
  file: Buffer,
  fileName: string,
  fileType: string,
  folder: string = 'uploads'
): Promise<string> => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME as string,
    Key: `${folder}/${Date.now()}-${fileName}`,
    Body: file,
    ContentType: fileType,
    ACL: 'public-read',
  }

  try {
    const data = await s3.upload(params).promise()
    return data.Location
  } catch (error) {
    console.error('S3 upload error:', error)
    throw new Error('Error uploading file to S3')
  }
}

export const deleteFromS3 = async (fileUrl: string): Promise<void> => {
  // Extract the key from the URL
  const key = fileUrl.split('.com/')[1]

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME as string,
    Key: key,
  }

  try {
    await s3.deleteObject(params).promise()
  } catch (error) {
    console.error('S3 delete error:', error)
    throw new Error('Error deleting file from S3')
  }
}

export default s3
*/ 