import mongoose from "mongoose"
import { setServers } from "node:dns/promises"
import dns from "node:dns"

// ── DNS fix for Windows / IPv6 issues ─────────────────────────────
setServers(["8.8.8.8", "8.8.4.4"])
dns.setDefaultResultOrder("ipv4first")

// ── Connection state ───────────────────────────────────────────────
let isConnected = false
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 3000

// ── Helpers ────────────────────────────────────────────────────────
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

const getMongoUri = (): string => {
  const uri = process.env.MONGO_URI
  if (!uri) {
    throw new Error("❌ MONGO_URI is not defined in environment variables")
  }
  return uri
}

// ── Main connection function ───────────────────────────────────────
export async function connectDB(retries = MAX_RETRIES): Promise<void> {
  // return early if already connected
  if (isConnected) {
    if (process.env.NODE_ENV === "development") {
      console.log("✅ MongoDB: Using existing connection")
    }
    return
  }

  // validate URI before attempting
  const url = getMongoUri()

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 MongoDB: Connecting... (attempt ${attempt}/${retries})`)

      const conn = await mongoose.connect(url, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,        // max connections in pool
        minPoolSize: 2,         // keep min 2 connections alive
        retryWrites: true,
      })

      isConnected = true

      console.log(`✅ MongoDB connected: ${conn.connection.host}`)
      console.log(`📦 Database: ${conn.connection.name}`)

      // ── Mongoose global settings ─────────────────────────────────
      mongoose.set("strictQuery", true)  // only save fields in schema

      // ── Connection event listeners ───────────────────────────────
      mongoose.connection.on("disconnected", () => {
        console.warn("⚠️  MongoDB disconnected")
        isConnected = false
      })

      mongoose.connection.on("reconnected", () => {
        console.log("✅ MongoDB reconnected")
        isConnected = true
      })

      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB error:", err.message)
        isConnected = false
      })

      return // success — exit the retry loop

    } catch (error) {
      const isLastAttempt = attempt === retries

      if (isLastAttempt) {
        console.error("❌ MongoDB: All connection attempts failed")
        console.error(error)
        process.exit(1)
      }

      console.warn(
        `⚠️  MongoDB: Attempt ${attempt} failed. Retrying in ${RETRY_DELAY_MS / 1000}s...`
      )
      await sleep(RETRY_DELAY_MS)
    }
  }
}

// ── Graceful shutdown ──────────────────────────────────────────────
export async function disconnectDB(): Promise<void> {
  if (!isConnected) return
  try {
    await mongoose.connection.close()
    isConnected = false
    console.log("🔌 MongoDB: Connection closed gracefully")
  } catch (error) {
    console.error("❌ MongoDB: Error during disconnection", error)
  }
}

// ── Handle process termination ─────────────────────────────────────
process.on("SIGINT", async () => {
  await disconnectDB()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  await disconnectDB()
  process.exit(0)
})