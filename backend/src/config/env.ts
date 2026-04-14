import {z} from 'zod'
import dotenv from 'dotenv'


dotenv.config();

const env_Schema = z.object({
  
    NODE_ENV: z.enum(['development', 'production', 'test']).default("development"),
    PORT : z.string().default("5000"),
   
    CLIENT_URL: z.string().min(1, 'CLIENT_URL is required'),
  
    MONGO_URI: z.string().min(1,'MONGO_URI is required' ),
    ACCESS_TOKEN_SECRET : z.string().min(40, "ACCESS_TOKEN_SECRET must be at least 40 chars"),
    REFRESH_TOKEN_SECRET : z.string().min(40, "REFRESH_TOKEN_SECRET must be at least 40 chars"),

   RESEND_API_KEY:z.string(),
   EMAIL_FROM:z.string(),


    CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
    CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
    CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
})

const  parsed = env_Schema.safeParse(process.env);


if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  parsed.error.issues.forEach((issue) => {
    console.error(`   ${issue.path.join('.')} — ${issue.message}`)
  })
  process.exit(1)
}

export const env = parsed.data