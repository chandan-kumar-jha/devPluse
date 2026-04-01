import {z} from 'zod'
import dotenv from 'dotenv'


dotenv.config();

const env_Schema = z.object({
    //Enum ka matlab hai allowed values ki ek fixed list. Agar koi inke alawa kuch bhi dalta hai, to Zod error dega.
    //Default ka matlab hai agar value provide nahi ki gayi, to ye automatic le lo
    NODE_ENV: z.enum(['development', 'production', 'test']).default("development"),
    PORT : z.string().default("5000"),
    //.url() ensure karta hai valid URL ho
    CLIENT_URL: z.string().min(1, 'CLIENT_URL is required'),
    // .env me missing hai → App start nahi hogi Error: "MONGO_URI is required"
    MONGO_URI: z.string().min(1,'MONGO_URI is required' ),
    ACCESS_TOKEN_SECRET : z.string().min(40, "ACCESS_TOKEN_SECRET must be at least 40 chars"),
    REFRESH_TOKEN_SECRET : z.string().min(40, "REFRESH_TOKEN_SECRET must be at least 40 chars"),

    EMAIL_USER: z.string().email('EMAIL_USER must be a valid email'),
EMAIL_PASS: z.string().min(1, 'EMAIL_PASS is required'),

    CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
    CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
    CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
})

/*
Jab bhi app start hoti hai, ye check karta hai ki .env file me saari required values hain ya nahi. Agar kuch missing ya galat hai to app crash kar deta hai.
 */

const  parsed = env_Schema.safeParse(process.env);


if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  parsed.error.issues.forEach((issue) => {
    console.error(`   ${issue.path.join('.')} — ${issue.message}`)
  })
  process.exit(1)
}

export const env = parsed.data